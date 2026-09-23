import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
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
const otp = {
    verify: Object.assign(verify, verify),
}

export default otp