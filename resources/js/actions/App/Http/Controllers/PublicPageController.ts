import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PublicPageController::documents
 * @see app/Http/Controllers/PublicPageController.php:17
 * @route '/dokumen'
 */
export const documents = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: documents.url(options),
    method: 'get',
})

documents.definition = {
    methods: ["get","head"],
    url: '/dokumen',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PublicPageController::documents
 * @see app/Http/Controllers/PublicPageController.php:17
 * @route '/dokumen'
 */
documents.url = (options?: RouteQueryOptions) => {
    return documents.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PublicPageController::documents
 * @see app/Http/Controllers/PublicPageController.php:17
 * @route '/dokumen'
 */
documents.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: documents.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PublicPageController::documents
 * @see app/Http/Controllers/PublicPageController.php:17
 * @route '/dokumen'
 */
documents.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: documents.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PublicPageController::documents
 * @see app/Http/Controllers/PublicPageController.php:17
 * @route '/dokumen'
 */
    const documentsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: documents.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PublicPageController::documents
 * @see app/Http/Controllers/PublicPageController.php:17
 * @route '/dokumen'
 */
        documentsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: documents.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PublicPageController::documents
 * @see app/Http/Controllers/PublicPageController.php:17
 * @route '/dokumen'
 */
        documentsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: documents.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    documents.form = documentsForm
/**
* @see \App\Http\Controllers\PublicPageController::events
 * @see app/Http/Controllers/PublicPageController.php:33
 * @route '/agenda'
 */
export const events = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: events.url(options),
    method: 'get',
})

events.definition = {
    methods: ["get","head"],
    url: '/agenda',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PublicPageController::events
 * @see app/Http/Controllers/PublicPageController.php:33
 * @route '/agenda'
 */
events.url = (options?: RouteQueryOptions) => {
    return events.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PublicPageController::events
 * @see app/Http/Controllers/PublicPageController.php:33
 * @route '/agenda'
 */
events.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: events.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PublicPageController::events
 * @see app/Http/Controllers/PublicPageController.php:33
 * @route '/agenda'
 */
events.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: events.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PublicPageController::events
 * @see app/Http/Controllers/PublicPageController.php:33
 * @route '/agenda'
 */
    const eventsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: events.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PublicPageController::events
 * @see app/Http/Controllers/PublicPageController.php:33
 * @route '/agenda'
 */
        eventsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: events.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PublicPageController::events
 * @see app/Http/Controllers/PublicPageController.php:33
 * @route '/agenda'
 */
        eventsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: events.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    events.form = eventsForm
const PublicPageController = { documents, events }

export default PublicPageController