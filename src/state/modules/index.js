import camelCase from 'lodash/camelCase'

const modulesCache = {}
const storeData = {
  modules: {}
}

// Используем import.meta.glob для получения всех файлов
const requireModule = import.meta.glob('./*.js', { eager: true })

// Обход всех модулей и выполнение кода из каждого модуля
Object.keys(requireModule).forEach((fileName) => {
  const moduleDefinition = requireModule[fileName]

  // Skip the module during hot reload if it refers to the
  // same module definition as the one we have cached.
  if (modulesCache[fileName] === moduleDefinition) return

  // Update the module cache, for efficient hot reloading.
  modulesCache[fileName] = moduleDefinition

  // Get the module path as an array.
  const modulePath = fileName
    // Remove the "./" from the beginning.
    .replace(/^\.\//, '')
    // Remove the file extension from the end.
    .replace(/\.\w+$/, '')
    // Split nested modules into an array path.
    .split(/\//)
    // camelCase all module namespaces and names.
    .map(camelCase)

  // Get the modules object for the current path.
  const { modules } = getNamespace(storeData, modulePath)

  // Add the module to our modules object.
  modules[modulePath.pop()] = {
    // Modules are namespaced by default.
    namespaced: true,
    ...moduleDefinition,
  }
})

// If the environment supports hot reloading...
if (import.meta.hot) {
  // Whenever any Vuex module is updated...
  import.meta.hot.accept(Object.keys(requireModule), () => {
    // Update `storeData.modules` with the latest definitions.
    updateModules()
    // Trigger a hot update in the store.
    import('../store').then((storeModule) => {
      storeModule.default.hotUpdate({ modules: storeData.modules })
    })
  })
}

// Recursively get the namespace of a Vuex module, even if nested.
function getNamespace(subtree, path) {
  if (path.length === 1) return subtree

  const namespace = path.shift()
  subtree.modules[namespace] = {
    modules: {},
    namespaced: true,
    ...subtree.modules[namespace],
  }
  return getNamespace(subtree.modules[namespace], path)
}

export default storeData.modules