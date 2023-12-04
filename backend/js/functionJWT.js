const jwt = require("jsonwebtoken");

function gerarCookieToken(id, miliSeg = 15000) {
  return `token = ${jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: miliSeg,
  })}; max-age=${miliSeg}`;
}

function autenticar(req, res, next) {
  let token = req.cookies.token;
  if (!req.cookies.token) token = req.headers["authorization"].split(" ")[1];

  if (!token) {
    return res.status(403).send("token nâo fornecido");
  }

  jwt.verify(token, process.env.SECRET_KEY, (er, decoded) => {
    if (er) return res.status(401).send("falha na autenticacâo do token");

    req.userId = decoded.id;
    next();
  });
}

function gerarCookieTokenADM(id, tipo, user = {}, miliSeg = 15000) {
  return `token = ${jwt.sign({ id, tipo, ...user }, process.env.SECRET_KEY, {
    expiresIn: miliSeg,
  })}; max-age=${miliSeg}`;
}

function autenticarADM(autorizado = []) {
  return (req, res, next) => {
    let token =
      req.cookies.token ||
      (req.headers["authorization"]
        ? req.headers["authorization"].split(" ")[1]
        : false);

    if (!token) {
      return res.status(401).send("token nâo fornecido");
    }


    jwt.verify(token, process.env.SECRET_KEY, (er, decoded) => {
      if (er) return res.status(400).send("falha na autenticacâo do token");

      req.superUser_id = decoded.superUser_id;
      console.log(decoded);

      for (const iterator of autorizado) {
        if (decoded.tipo === iterator || decoded.tipo === "ADM") {
          req.tokenInfo = decoded.user;
          return next();
        }
      }

      res.status(401).json({ inicio: true, msg: "você não está autorizado" });
    });
  };
}

module.exports = {
  gerarCookieToken,
  autenticar,
  gerarCookieTokenADM,
  autenticarADM,
};
