/**
 * Конфиг команд копирования
 */
export const COPY_COMMANDS = {
    FILTERED_KEYS: 'filtered-keys',
    ALL_KEYS: 'all-keys',
    FILTERED_TEMPLATE: 'filtered-template',
    ALL_TEMPLATE: 'all-template',
    FILTERED: 'filtered',
    ALL: 'all'
};

export const isFilteredCommand = (command) =>
    command.startsWith('filtered');

export const isTemplateCommand = (command) =>
    command.endsWith('template');

export const isExactCommand = (command, target) =>
    command === target;
