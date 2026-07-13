import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\TaskController::toggle
 * @see app/Http/Controllers/TaskController.php:204
 * @route '/subtasks/{subTask}/toggle'
 */
export const toggle = (args: { subTask: number | { id: number } } | [subTask: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggle.url(args, options),
    method: 'post',
})

toggle.definition = {
    methods: ["post"],
    url: '/subtasks/{subTask}/toggle',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TaskController::toggle
 * @see app/Http/Controllers/TaskController.php:204
 * @route '/subtasks/{subTask}/toggle'
 */
toggle.url = (args: { subTask: number | { id: number } } | [subTask: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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
 * @see app/Http/Controllers/TaskController.php:204
 * @route '/subtasks/{subTask}/toggle'
 */
toggle.post = (args: { subTask: number | { id: number } } | [subTask: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggle.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TaskController::toggle
 * @see app/Http/Controllers/TaskController.php:204
 * @route '/subtasks/{subTask}/toggle'
 */
    const toggleForm = (args: { subTask: number | { id: number } } | [subTask: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: toggle.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TaskController::toggle
 * @see app/Http/Controllers/TaskController.php:204
 * @route '/subtasks/{subTask}/toggle'
 */
        toggleForm.post = (args: { subTask: number | { id: number } } | [subTask: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: toggle.url(args, options),
            method: 'post',
        })
    
    toggle.form = toggleForm
const subtasks = {
    toggle: Object.assign(toggle, toggle),
}

export default subtasks