
export default async function getLocaleMessages() {
    const locales = import.meta.glob('../lang/*.json');
    const messages = {};
  
    for (const path in locales) {
      const matched = path.match(/([A-Za-z0-9-_]+)\./i);
      if (matched && matched.length > 1) {
        messages[path] = locales[path];
      }
    }
  
    return messages;
  }