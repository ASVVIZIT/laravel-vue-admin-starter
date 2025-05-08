import {useUserStore} from '@/stores/user';

export default {
    mounted(el, binding) {
        const userStore = useUserStore();
        const roles = userStore.roles;
        const { value } = binding;

        if (value && Array.isArray(value) && value.length > 0) {
            const requiredRoles = value;
            const hasRole = roles.some(role => requiredRoles.includes(role));

            if (!hasRole) {
                el.parentNode?.removeChild(el);
            }
        } else {
            throw new Error(`Roles are required! Example: v-role="['admin','editor']"`);
        }
    }
};
