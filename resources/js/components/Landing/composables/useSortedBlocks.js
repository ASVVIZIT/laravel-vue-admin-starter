/**
 * Composable для сортировки блоков
 */
import { computed } from 'vue'

export function useSortedBlocks(blocks) {
    return computed(() =>
        blocks.value
            .filter(b => b.enabled)
            .sort((a, b) => a.order - b.order)
    )
}
