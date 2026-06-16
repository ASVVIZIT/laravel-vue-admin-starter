import { siteModeApi } from './siteModeApi'
import { landingApi } from '../api/landingApi'
import { mockLanding } from '../config/mockLanding'
import { blockFactory } from '../config/blockFactory'

export async function getPublicPage(slug = 'public-home') {
    const siteMode = await siteModeApi.getCached()

    const loaders = {
        maintenance: () => Promise.resolve(buildMaintenancePage(siteMode.maintenance)),
        landing: () => loadLandingPage(siteMode.active_landing_id),
        production: () => loadProductionPage(slug)
    }

    const loader = loaders[siteMode.mode] || loaders.maintenance

    try {
        return await loader()
    } catch (error) {
        return mockLanding
    }
}

async function loadLandingPage(landingId) {
    if (!landingId) return buildMaintenancePage()
    const response = await landingApi.getById(landingId)
    return response.data || response
}

async function loadProductionPage(slug) {
    const response = await landingApi.getPublic(slug)
    return response.data || response
}

function buildMaintenancePage(settings = {}) {
    return {
        id: 0,
        slug: 'maintenance',
        title: settings.title || 'Сайт в разработке',
        is_published: true,
        settings: {
            theme: {
                primaryColor: '#ff6b35',
                backgroundColor: '#0a0e27',
                textColor: '#ffffff'
            },
            countdown: {
                targetDate: settings.target_date || '2026-11-25T23:59:59'
            }
        },
        blocks: [
            blockFactory.create('hero', {
                id: 'maintenance-hero',
                order: 1,
                title: settings.title || 'Сайт в разработке',
                subtitle: settings.message || 'Мы готовим что-то невероятное'
            }),
            blockFactory.create('countdown', {
                id: 'maintenance-countdown',
                order: 2,
                targetDate: settings.target_date || '2026-11-25T23:59:59',
                showProgressBar: settings.show_countdown !== false
            })
        ]
    }
}

export async function getPublicBlocks(slug = 'public-home') {
    const page = await getPublicPage(slug)
    return page.blocks.filter(b => b.enabled).sort((a, b) => a.order - b.order)
}
