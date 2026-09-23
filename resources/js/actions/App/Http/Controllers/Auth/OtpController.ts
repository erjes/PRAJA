import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\OtpController::create
 * @see app/Http/Controllers/Auth/OtpController.php:17
 * @route '/verify-otp'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/verify-otp',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\OtpController::create
 * @see app/Http/Controllers/Auth/OtpController.php:17
 * @route '/verify-otp'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\OtpController::create
 * @see app/Http/Controllers/Auth/OtpController.php:17
 * @route '/verify-otp'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Auth\OtpController::create
 * @see app/Http/Controllers/Auth/OtpController.php:17
 * @route '/verify-otp'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Auth\OtpController::create
 * @see app/Http/Controllers/Auth/OtpController.php:17
 * @route '/verify-otp'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Auth\OtpController::create
 * @see app/Http/Controllers/Auth/OtpController.php:17
 * @route '/verify-otp'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Auth\OtpController::create
 * @see app/Http/Controllers/Auth/OtpController.php:17
 * @route '/verify-otp'
 */
        createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    create.form = createForm
/**
* @see \App\Http\Controllers\Auth\OtpController::verify
 * @see app/Http/Controllers/Auth/OtpController.php:28
 * @route '/verify-otp'
 */
export const verify = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(options),
    method: 'post',
})

verify.definition = {
    methods: ["post"],
    url: '/verify-otp',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\OtpController::verify
 * @see app/Http/Controllers/Auth/OtpController.php:28
 * @route '/verify-otp'
 */
verify.url = (options?: RouteQueryOptions) => {
    return verify.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\OtpController::verify
 * @see app/Http/Controllers/Auth/OtpController.php:28
 * @route '/verify-otp'
 */
verify.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Auth\OtpController::verify
 * @see app/Http/Controllers/Auth/OtpController.php:28
 * @route '/verify-otp'
 */
    const verifyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: verify.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Auth\OtpController::verify
 * @see app/Http/Controllers/Auth/OtpController.php:28
 * @route '/verify-otp'
 */
        verifyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: verify.url(options),
            method: 'post',
        })
    
    verify.form = verifyForm
const OtpController = { create, verify }

export default OtpController