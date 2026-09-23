import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\OtpController::form
 * @see app/Http/Controllers/Auth/OtpController.php:17
 * @route '/verify-otp'
 */
export const form = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: form.url(options),
    method: 'get',
})

form.definition = {
    methods: ["get","head"],
    url: '/verify-otp',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\OtpController::form
 * @see app/Http/Controllers/Auth/OtpController.php:17
 * @route '/verify-otp'
 */
form.url = (options?: RouteQueryOptions) => {
    return form.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\OtpController::form
 * @see app/Http/Controllers/Auth/OtpController.php:17
 * @route '/verify-otp'
 */
form.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: form.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Auth\OtpController::form
 * @see app/Http/Controllers/Auth/OtpController.php:17
 * @route '/verify-otp'
 */
form.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: form.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Auth\OtpController::form
 * @see app/Http/Controllers/Auth/OtpController.php:17
 * @route '/verify-otp'
 */
    const formForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: form.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Auth\OtpController::form
 * @see app/Http/Controllers/Auth/OtpController.php:17
 * @route '/verify-otp'
 */
        formForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: form.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Auth\OtpController::form
 * @see app/Http/Controllers/Auth/OtpController.php:17
 * @route '/verify-otp'
 */
        formForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: form.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    form.form = formForm