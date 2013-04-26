tcpSupport = function(server, jserver) {
  server.tcpNoDelay = function(nodelay) {
    if (nodelay === undefined) {
      return jserver.isTCPNoDelay();
    } else {
      jserver.setTCPNoDelay(nodelay);
      return server;
    }
  };
  server.sendBufferSize = function(size) {
    if (size === undefined) {
      return jserver.getSendBufferSize();
    } else {
      jserver.setSendBufferSize(size);
      return server;
    }
  };
  server.receiveBufferSize = function(size) {
    if (size === undefined) {
      return jserver.getReceiveBufferSize();
    } else {
      jserver.setReceiveBufferSize(size);
      return server;
    }
  };
  server.tcpKeepAlive = function(keepAlive) {
    if (keepAlive === undefined) {
      return jserver.isTCPKeepAlive();
    } else {
      jserver.setTCPKeepAlive(keepAlive);
      return server;
    }
  };
  server.reuseAddress = function(reuse) {
    if (reuse === undefined) {
      return jserver.isReuseAddress();
    } else {
      jserver.setReuseAddress(reuse);
      return server;
    }
  };
  server.soLinger = function(linger) {
    if (linger === undefined) {
      return jserver.isSoLinger();
    } else {
      jserver.setSoLinger(linger);
      return server;
    }
  };
  server.trafficClass = function(cls) {
    if (cls === undefined) {
      return jserver.getTrafficClass();
    } else {
      jserver.setTrafficClass(cls);
      return server;
    }
  };
  server.usePooledBuffers = function(use) {
    if (use === undefined) {
      return jserver.isUsedPooledBuffers();
    } else {
      jserver.setUsePooledBuffers(use);
      return server;
    }
  };
}

serverTcpSupport = function(server, jserver) {
  server.acceptBacklog = function(backlog) {
    if (backlog === undefined) {
      return jserver.getAcceptBacklog();
    } else {
      jserver.setAcceptBacklog(backlog);
      return server;
    }
  };
}
