import { useUserStore } from '@/store/user';

export default {
    mounted(el, binding) {
        const userStore = useUserStore();
        const { value } = binding;

        if (value && Array.isArray(value) && value.length) {
            const requiredPermissions = value;
            const hasPermission = userStore.permissions.some(permission =>
                requiredPermissions.includes(permission)
            );

            if (!hasPermission && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        } else {
            throw new Error('Permissions are required! Example: v-permission="[\'manage user\',\'manage permission\']"');
        }
    }
};
