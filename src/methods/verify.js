const deleteProp = (target, key) => {
  const newObj = { ...target }
  newObj[key] && delete newObj[key]
  return newObj
}

const deleteAllProp = target => {
  const newObj = { ...target }
  Object.keys(newObj).forEach(key => deleteProp(newObj[key], 'validator'))
  return newObj
}

export default function(name) {
  const verifyData = { ...this._data.$vec }
  return name
    ? verifyData
      ? deleteProp(verifyData[name], 'validator')
      : { pass: true, msg: '' }
    : verifyData
      ? deleteAllProp(verifyData)
      : {}
}
