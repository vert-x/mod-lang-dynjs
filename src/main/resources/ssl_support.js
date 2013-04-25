sslSupport = function(jsObj, jObj) {
  jsObj.ssl = function(ssl) {
    if (ssl === undefined) {
      return jObj.isSSL();
    } else {
      jObj.setSSL(ssl);
      return jsObj;
    }
  };
  jsObj.keyStorePath = function(path) {
    if (path === undefined) {
      return jObj.getKeyStorePath();
    } else {
      jObj.setKeyStorePath(path);
      return jsObj;
    }
  };
  jsObj.keyStorePassword = function(password) {
    if (password === undefined) {
      return jObj.getKeyStorePassword();
    } else {
      jObj.setKeyStorePassword(password);
      return jsObj;
    }
  };
  jsObj.trustStorePath = function(path) {
    if (path === undefined) {
      return jObj.getTrustStorePath();
    } else {
      jObj.setTrustStorePath(path);
      return jsObj;
    }
  };
  jsObj.trustStorePassword = function(password) {
    if (password === undefined) {
      return jObj.getTrustStorePassword();
    } else {
      jObj.setTrustStorePassword(password);
      return jsObj;
    }
  };
}

serverSslSupport = function(jsObj, jObj) {
  jsObj.clientAuthRequired = function(required) {
    if (required === undefined) {
      return jObj.isClientAuthRequired();
    } else {
      jObj.setClientAuthRequired(required);
      return jsObj;
    }
  };
}

clientSslSupport = function(jsObj, jObj) {
  jsObj.trustAll = function(all) {
    if (all === undefined) {
      return jObj.isTrustAll();
    } else {
      jObj.setTrustAll(all);
      return jsObj;
    }
  };
}
