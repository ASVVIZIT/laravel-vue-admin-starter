import { createApp, h, ref, nextTick } from 'vue';
import VideoMessageComponent from '@/modules/Video/utils/videoMessage/videoMessage.vue';

const messageGroups = new Map();
let currentGroupId = null;
let groupCounter = 0;
const scrollThreshold = 50; // Общая константа порога для всех компонентов

const defaultOptions = {
    position: 'top-right',
    offset: { x: '40px', y: '40px' },
    width: '240px',
    animationMode: 'inside',
    animationSpeed: 300
};

const createMessageGroup = (config = defaultOptions) => {
    const groupId = `group-${groupCounter++}`;
    const container = document.createElement('div');
    container.className = 'fenix-video-messages-container';
    container.dataset.groupId = groupId;

    const applyPositionStyles = () => {
        container.removeAttribute('style');
        container.style.position = 'fixed';
        container.style.zIndex = '99999';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '4px';
        container.style.width = config.width || '240px';
        container.style.maxHeight = '90vh';
        container.style.maxWidth = 'calc(100vw - 80px)';
        container.style.overflow = 'hidden';

        const pos = config.position;
        const offset = config.offset;

        switch(pos) {
            case 'top-right':
                container.style.top = offset.y || '40px';
                container.style.right = offset.x || '40px';
                break;
            case 'top-left':
                container.style.top = offset.y || '40px';
                container.style.left = offset.x || '40px';
                break;
            case 'bottom-right':
                container.style.bottom = offset.y || '40px';
                container.style.right = offset.x || '40px';
                break;
            case 'bottom-left':
                container.style.bottom = offset.y || '40px';
                container.style.left = offset.x || '40px';
                break;
            case 'top-center':
                container.style.top = offset.y || '40px';
                container.style.left = '50%';
                container.style.transform = 'translateX(-50%)';
                break;
            case 'bottom-center':
                container.style.bottom = offset.y || '40px';
                container.style.left = '50%';
                container.style.transform = 'translateX(-50%)';
                break;
            default:
                container.style.top = '40px';
                container.style.right = '40px';
        }
    };

    document.body.appendChild(container);
    applyPositionStyles();

    const messageComponent = ref(null);
    const AppComponent = {
        setup() {
            return { messageComponent };
        },
        render() {
            return h(VideoMessageComponent, {
                ref: messageComponent,
                animationMode: config.animationMode,
                animationSpeed: config.animationSpeed
            });
        }
    };

    const app = createApp(AppComponent);
    const appInstance = app.mount(container);

    const updateScroll = () => {
        nextTick(() => {
            if (messageComponent.value && messageComponent.value.scrollToBottom) {
                messageComponent.value.scrollToBottom();
            }
        });
    };

    messageGroups.set(groupId, {
        id: groupId,
        container,
        app,
        appInstance,
        messageComponent,
        config,
        applyPositionStyles,
        updateScroll,
        lastKnownPositions: new Map(),
        hasScroll: false
    });

    return groupId;
};

const getOrCreateGroup = (config) => {
    for (const [groupId, group] of messageGroups.entries()) {
        const isSamePosition = group.config.position === config.position;
        const isSameOffset = JSON.stringify(group.config.offset) === JSON.stringify(config.offset);
        const isSameWidth = group.config.width === config.width;
        const isSameAnimation = group.config.animationMode === config.animationMode;
        const isSameSpeed = group.config.animationSpeed === config.animationSpeed;

        if (isSamePosition && isSameOffset && isSameWidth && isSameAnimation && isSameSpeed) {
            return groupId;
        }
    }

    return createMessageGroup(config);
};

const calculateTargetPosition = (group) => {
    const container = group.container;
    const containerRect = container.getBoundingClientRect();

    // Определяем, есть ли вертикальный скролл
    const hasVerticalScroll = container.scrollHeight > container.clientHeight;
    group.hasScroll = hasVerticalScroll;

    if (hasVerticalScroll) {
        // Используем константу порога
        return {
            top: containerRect.bottom - scrollThreshold,
            left: containerRect.left,
            containerHeight: containerRect.height
        };
    }

    // Для контейнера без скролла - позиционируем под последним сообщением
    let targetTop = containerRect.top;
    const existingMessages = container.querySelectorAll('.fenix-video-message');

    if (existingMessages.length > 0) {
        const lastMessage = existingMessages[existingMessages.length - 1];
        const lastMessageRect = lastMessage.getBoundingClientRect();
        targetTop = lastMessageRect.bottom + 4;
    }

    return {
        top: targetTop,
        left: containerRect.left,
        containerHeight: containerRect.height
    };
};

const updateKnownPositions = (group) => {
    group.lastKnownPositions.clear();
    const containerRect = group.container.getBoundingClientRect();
    const messages = group.container.querySelectorAll('.fenix-video-message');

    messages.forEach(msg => {
        const rect = msg.getBoundingClientRect();
        group.lastKnownPositions.set(msg.dataset.id, {
            top: rect.top,
            bottom: rect.bottom,
            height: rect.height
        });
    });
};

const showMessage = (type, content, duration, persistent = false, debug = false) => {
    // Проверяем, существует ли текущая группа, если нет - создаем новую
    if (!currentGroupId || !messageGroups.has(currentGroupId)) {
        currentGroupId = createMessageGroup();
    }

    const group = messageGroups.get(currentGroupId);
    const initDelay = group.messageComponent.value ? 0 : 300;

    setTimeout(() => {
        const addMessage = () => {
            if (!group.messageComponent.value) {
                setTimeout(() => {
                    if (group.messageComponent.value && group.messageComponent.value[type]) {
                        group.messageComponent.value[type](content, duration, persistent, debug);
                        group.updateScroll();
                        setTimeout(() => updateKnownPositions(group), 100);
                    }
                }, 100);
            } else if (group.messageComponent.value[type]) {
                group.messageComponent.value[type](content, duration, persistent, debug);
                group.updateScroll();
                setTimeout(() => updateKnownPositions(group), 100);
            }
        };

        if (group.config.animationMode === 'screen') {
            const position = calculateTargetPosition(group);
            const tempMessage = document.createElement('div');
            tempMessage.className = `fenix-video-message fenix-video-message--${type} fenix-animation-temp`;
            if (debug) tempMessage.classList.add('fenix-video-message--debug');

            const icon = type === 'success' ? '✓' :
                type === 'warning' ? '⚠' :
                    type === 'error' ? '✕' :
                        type === 'debug' ? '🐞' : 'ℹ';

            const title = type === 'success' ? 'Успешно!' :
                type === 'warning' ? 'Внимание!' :
                    type === 'error' ? 'Ошибка!' :
                        type === 'debug' ? 'Отладка' : 'Информация';

            tempMessage.innerHTML = `
                <div class="fenix-video-message__content-wrapper">
                    <div class="fenix-video-message__icon">${icon}</div>
                    <div class="fenix-video-message__content">
                        <div class="fenix-video-message__title">
                            ${title}
                            ${debug ? '<span class="fenix-video-message__debug-tag">DEBUG</span>' : ''}
                        </div>
                        <div class="fenix-video-message__text">${content}</div>
                    </div>
                </div>
            `;

            tempMessage.style.position = 'fixed';
            tempMessage.style.zIndex = '100000';
            tempMessage.style.top = `${position.top}px`;

            // Улучшенная анимация для правой стороны
            if (group.config.position.includes('right')) {
                tempMessage.style.left = `${window.innerWidth + 100}px`;
            } else {
                tempMessage.style.left = '100%';
            }

            // Используем настройку скорости анимации
            const animationSpeed = group.config.animationSpeed || 300;
            const topSpeed = animationSpeed / 3.6;
            tempMessage.style.transition = `left ${animationSpeed}ms cubic-bezier(0.2, 0.1, 0.1, 1), top ${topSpeed}ms ease`;

            tempMessage.style.width = group.container.clientWidth + 'px';
            tempMessage.style.maxWidth = 'calc(100vw - 80px)';
            tempMessage.style.boxSizing = 'border-box';
            tempMessage.style.pointerEvents = 'none';

            document.body.appendChild(tempMessage);

            requestAnimationFrame(() => {
                tempMessage.style.left = `${position.left}px`;

                let currentTop = position.top;
                const adjustPosition = () => {
                    if (group.container && group.container.isConnected) {
                        const newPosition = calculateTargetPosition(group);

                        // Корректируем позицию, чтобы оставалась в видимой области
                        const viewportHeight = window.innerHeight;
                        const maxTop = viewportHeight - 100;
                        currentTop = Math.min(maxTop, newPosition.top);

                        tempMessage.style.top = `${currentTop}px`;
                    }
                };

                const adjustInterval = setInterval(adjustPosition, 10);

                setTimeout(() => {
                    clearInterval(adjustInterval);
                    tempMessage.remove();

                    if (group.container && group.container.isConnected) {
                        setTimeout(addMessage, 200);
                    } else {
                        currentGroupId = createMessageGroup(group.config);
                        setTimeout(addMessage, 200);
                    }
                }, animationSpeed);
            });
        } else {
            addMessage();
        }
    }, initDelay);
};

const configure = (options = {}) => {
    const newConfig = {
        position: options.position || defaultOptions.position,
        offset: {
            ...defaultOptions.offset,
            ...(options.offset || {})
        },
        width: options.width || defaultOptions.width,
        animationMode: options.animationMode || defaultOptions.animationMode,
        animationSpeed: options.animationSpeed || defaultOptions.animationSpeed
    };

    currentGroupId = getOrCreateGroup(newConfig);

    // Если группа не существует (например, была удалена), создаем новую
    if (!messageGroups.has(currentGroupId)) {
        currentGroupId = createMessageGroup(newConfig);
    }
};

const resetConfiguration = () => {
    configure(defaultOptions);
};

const clearAllMessages = () => {
    for (const group of messageGroups.values()) {
        if (group.messageComponent.value?.clear) {
            group.messageComponent.value.clear();
        }
        group.lastKnownPositions.clear();
        group.hasScroll = false;
    }
};

const unmountAll = () => {
    for (const group of messageGroups.values()) {
        group.app.unmount();
        if (group.container && group.container.parentNode) {
            group.container.parentNode.removeChild(group.container);
        }
    }
    messageGroups.clear();
    currentGroupId = null;
    groupCounter = 0; // Сбрасываем счетчик групп
    document.querySelectorAll('.fenix-animation-temp').forEach(el => el.remove());
};

setInterval(() => {
    for (const [groupId, group] of messageGroups.entries()) {
        if (group.messageComponent.value &&
            group.messageComponent.value.messages &&
            group.messageComponent.value.messages.length === 0) {

            setTimeout(() => {
                if (group.messageComponent.value &&
                    group.messageComponent.value.messages &&
                    group.messageComponent.value.messages.length === 0) {

                    group.app.unmount();
                    if (group.container && group.container.parentNode) {
                        group.container.parentNode.removeChild(group.container);
                    }
                    messageGroups.delete(groupId);

                    if (currentGroupId === groupId) {
                        currentGroupId = null;
                    }
                }
            }, 1000);
        }
    }
}, 5000);


export default {
    configure,
    resetConfiguration,
    success: (content, duration = 3000, persistent = false, debug = false) =>
        showMessage('success', content, duration, persistent, debug),
    warning: (content, duration = 4000, persistent = false, debug = false) =>
        showMessage('warning', content, duration, persistent, debug),
    error: (content, duration = 5000, persistent = false, debug = false) =>
        showMessage('error', content, duration, persistent, debug),
    info: (content, duration = 3000, persistent = false, debug = false) =>
        showMessage('info', content, duration, persistent, debug),
    debug: (content, duration = 10000, persistent = false) =>
        showMessage('debug', content, duration, persistent, true),
    clear: clearAllMessages,
    unmount: unmountAll,
    getStats: () => {
        return {
            groupCount: messageGroups.size
        };
    }
};
