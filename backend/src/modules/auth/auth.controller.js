const authService = require("./auth.service");

async function register(req, res, next) {
  try {
    const { email, password, fullName } = req.body;
    const user = await authService.registerUser({ email, password, fullName });

    res.status(201).json({
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    res.json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function registerAdmin(req, res, next) {
  try {
    const { email, password, fullName } = req.body;
    const user = await authService.registerAdmin({ email, password, fullName });

    res.status(201).json({
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  registerAdmin,
};
