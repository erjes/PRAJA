import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\TaskController::toggle
 * @see app/Http/Controllers/TaskController.php:358
 * @route '/subtasks/{subTask}/toggle'
 */
export const toggle = (args: { subTask: string | number | { id: string | number } } | [subTask: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggle.url(args, options),
    method: 'post',
})

toggle.definition = {
    methods: ["post"],
    url: '/subtasks/{subTask}/toggle',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TaskController::toggle
 * @see app/Http/Controllers/TaskController.php:358
 * @route '/subtasks/{subTask}/toggle'
 */
toggle.url = (args: { subTask: string | number | { id: string | number } } | [subTask: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subTask: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subTask: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subTask: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subTask: typeof args.subTask === 'object'
                ? args.subTask.id
                : args.subTask,
                }

    return toggle.definition.url
            .replace('{subTask}', parsedArgs.subTask.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TaskController::toggle
 * @see app/Http/Controllers/TaskController.php:358
 * @route '/subtasks/{subTask}/toggle'
 */
toggle.post = (args: { subTask: string | number | { id: string | number } } | [subTask: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggle.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TaskController::toggle
 * @see app/Http/Controllers/TaskController.php:358
 * @route '/subtasks/{subTask}/toggle'
 */
    const toggleForm = (args: { subTask: string | number | { id: string | number } } | [subTask: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: toggle.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TaskController::toggle
 * @see app/Http/Controllers/TaskController.php:358
 * @route '/subtasks/{subTask}/toggle'
 */
        toggleForm.post = (args: { subTask: string | number | { id: string | number } } | [subTask: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: toggle.url(args, options),
            method: 'post',
        })
    
    toggle.form = toggleForm
const subtasks = {
    toggle: Object.assign(toggle, toggle),
}

export default subtasks