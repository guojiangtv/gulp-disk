module.exports = function(api) {
    api.cache(true)
    return {
        'ignore': [
            /(.*)raphael-min\.js/,  
            /(.*)flv\.js/,  
            /(.*)bodymovin\.js/,  
            /(.*)sea\.js/,  
            /(.*)sea\.min\.js/,  
            /(.*)webSocket\.js/,  
            /(.*)swfobject\.js/,  
            /(.*)clipboard\.min\.js/,  
            /(.*)jquery\.(.*)\.js/,  
            /(.*)ZeroClipboard\.(.*)\.js/,  
            /(.*)sea-css\.js/,  
            /(.*)json2\.js/,  
            /(.*)md5\.js/,  
            /(.*)pikaday\.js/,  
            /(.*)popCheckbox\.js/,  
            /(.*)qrcode\.min\.js/,  
            /(.*)rsa\.js/,  
            /(.*)storage\.js/,  
            /(.*)StackBlur\.js/,  
            /(.*)gt\.js/,  
            /(.*)idangerous\.swiper\.min\.js/,  
            /(.*)share\\api_base\.js/
        ], // 忽略
        "presets": [
            '@babel/preset-env'
        ]
    }
  }