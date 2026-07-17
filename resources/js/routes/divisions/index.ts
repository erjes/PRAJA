import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\DivisionController::index
 * @see app/Http/Controllers/DivisionController.php:14
 * @route '/divisions'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/divisions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DivisionController::index
 * @see app/Http/Controllers/DivisionController.php:14
 * @route '/divisions'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DivisionController::index
 * @see app/Http/Controllers/DivisionController.php:14
 * @route '/divisions'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DivisionController::index
 * @see app/Http/Controllers/DivisionController.php:14
 * @route '/divisions'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DivisionController::index
 * @see app/Http/Controllers/DivisionController.php:14
 * @route '/divisions'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DivisionController::index
 * @see app/Http/Controllers/DivisionController.php:14
 * @route '/divisions'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DivisionController::index
 * @see app/Http/Controllers/DivisionController.php:14
 * @route '/divisions'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\DivisionController::create
 * @see app/Http/Controllers/DivisionController.php:0
 * @route '/divisions/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/divisions/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DivisionController::create
 * @see app/Http/Controllers/DivisionController.php:0
 * @route '/divisions/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DivisionController::create
 * @see app/Http/Controllers/DivisionController.php:0
 * @route '/divisions/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DivisionController::create
 * @see app/Http/Controllers/DivisionController.php:0
 * @route '/divisions/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DivisionController::create
 * @see app/Http/Controllers/DivisionController.php:0
 * @route '/divisions/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DivisionController::create
 * @see app/Http/Controllers/DivisionController.php:0
 * @route '/divisions/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DivisionController::create
 * @see app/Http/Controllers/DivisionController.php:0
 * @route '/divisions/create'
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
* @see \App\Http\Controllers\DivisionController::store
 * @see app/Http/Controllers/DivisionController.php:29
 * @route '/divisions'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/divisions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DivisionController::store
 * @see app/Http/Controllers/DivisionController.php:29
 * @route '/divisions'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DivisionController::store
 * @see app/Http/Controllers/DivisionController.php:29
 * @route '/divisions'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\DivisionController::store
 * @see app/Http/Controllers/DivisionController.php:29
 * @route '/divisions'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DivisionController::store
 * @see app/Http/Controllers/DivisionController.php:29
 * @route '/divisions'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\DivisionController::show
 * @see app/Http/Controllers/DivisionController.php:0
 * @route '/divisions/{division}'
 */
export const show = (args: { division: string | number } | [division: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/divisions/{division}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DivisionController::show
 * @see app/Http/Controllers/DivisionController.php:0
 * @route '/divisions/{division}'
 */
show.url = (args: { division: string | number } | [division: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { division: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    division: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        division: args.division,
                }

    return show.definition.url
            .replace('{division}', parsedArgs.division.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DivisionController::show
 * @see app/Http/Controllers/DivisionController.php:0
 * @route '/divisions/{division}'
 */
show.get = (args: { division: string | number } | [division: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DivisionController::show
 * @see app/Http/Controllers/DivisionController.php:0
 * @route '/divisions/{division}'
 */
show.head = (args: { division: string | number } | [division: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DivisionController::show
 * @see app/Http/Controllers/DivisionController.php:0
 * @route '/divisions/{division}'
 */
    const showForm = (args: { division: string | number } | [division: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DivisionController::show
 * @see app/Http/Controllers/DivisionController.php:0
 * @route '/divisions/{division}'
 */
        showForm.get = (args: { division: string | number } | [division: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DivisionController::show
 * @see app/Http/Controllers/DivisionController.php:0
 * @route '/divisions/{division}'
 */
        showForm.head = (args: { division: string | number } | [division: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\DivisionController::edit
 * @see app/Http/Controllers/DivisionController.php:0
 * @route '/divisions/{division}/edit'
 */
export const edit = (args: { division: string | number } | [division: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/divisions/{division}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DivisionController::edit
 * @see app/Http/Controllers/DivisionController.php:0
 * @route '/divisions/{division}/edit'
 */
edit.url = (args: { division: string | number } | [division: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { division: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    division: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        division: args.division,
                }

    return edit.definition.url
            .replace('{division}', parsedArgs.division.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DivisionController::edit
 * @see app/Http/Controllers/DivisionController.php:0
 * @route '/divisions/{division}/edit'
 */
edit.get = (args: { division: string | number } | [division: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DivisionController::edit
 * @see app/Http/Controllers/DivisionController.php:0
 * @route '/divisions/{division}/edit'
 */
edit.head = (args: { division: string | number } | [division: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DivisionController::edit
 * @see app/Http/Controllers/DivisionController.php:0
 * @route '/divisions/{division}/edit'
 */
    const editForm = (args: { division: string | number } | [division: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DivisionController::edit
 * @see app/Http/Controllers/DivisionController.php:0
 * @route '/divisions/{division}/edit'
 */
        editForm.get = (args: { division: string | number } | [division: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DivisionController::edit
 * @see app/Http/Controllers/DivisionController.php:0
 * @route '/divisions/{division}/edit'
 */
        editForm.head = (args: { division: string | number } | [division: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    edit.form = editForm
/**
* @see \App\Http\Controllers\DivisionController::update
 * @see app/Http/Controllers/DivisionController.php:45
 * @route '/divisions/{division}'
 */
export const update = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/divisions/{division}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\DivisionController::update
 * @see app/Http/Controllers/DivisionController.php:45
 * @route '/divisions/{division}'
 */
update.url = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { division: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { division: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    division: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        division: typeof args.division === 'object'
                ? args.division.id
                : args.division,
                }

    return update.definition.url
            .replace('{division}', parsedArgs.division.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DivisionController::update
 * @see app/Http/Controllers/DivisionController.php:45
 * @route '/divisions/{division}'
 */
update.put = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\DivisionController::update
 * @see app/Http/Controllers/DivisionController.php:45
 * @route '/divisions/{division}'
 */
update.patch = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\DivisionController::update
 * @see app/Http/Controllers/DivisionController.php:45
 * @route '/divisions/{division}'
 */
    const updateForm = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DivisionController::update
 * @see app/Http/Controllers/DivisionController.php:45
 * @route '/divisions/{division}'
 */
        updateForm.put = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\DivisionController::update
 * @see app/Http/Controllers/DivisionController.php:45
 * @route '/divisions/{division}'
 */
        updateForm.patch = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\DivisionController::destroy
 * @see app/Http/Controllers/DivisionController.php:66
 * @route '/divisions/{division}'
 */
export const destroy = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/divisions/{division}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DivisionController::destroy
 * @see app/Http/Controllers/DivisionController.php:66
 * @route '/divisions/{division}'
 */
destroy.url = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { division: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { division: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    division: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        division: typeof args.division === 'object'
                ? args.division.id
                : args.division,
                }

    return destroy.definition.url
            .replace('{division}', parsedArgs.division.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DivisionController::destroy
 * @see app/Http/Controllers/DivisionController.php:66
 * @route '/divisions/{division}'
 */
destroy.delete = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\DivisionController::destroy
 * @see app/Http/Controllers/DivisionController.php:66
 * @route '/divisions/{division}'
 */
    const destroyForm = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DivisionController::destroy
 * @see app/Http/Controllers/DivisionController.php:66
 * @route '/divisions/{division}'
 */
        destroyForm.delete = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const divisions = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
store: Object.assign(store, store),
show: Object.assign(show, show),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default divisions