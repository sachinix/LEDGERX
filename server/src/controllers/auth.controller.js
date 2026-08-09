const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.service")
const tokenBlackListModel = require("../models/blackList.model")

/**
* - user register controller
* - POST /api/auth/register
*/
async function userRegisterController(req, res) {
    try {
        const { email, password, name } = req.body

        const isExists = await userModel.findOne({
            email: email
        })

        if (isExists) {
            return res.status(422).json({
                message: "User already exists with email.",
                status: "failed"
            })
        }

        const user = await userModel.create({
            email, password, name
        })

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" })

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 3 * 24 * 60 * 60 * 1000,
            path: '/'
        })

        res.status(201).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                systemUser: user.systemUser || false
            },
            token
        })

        emailService.sendRegistrationEmail(user.email, user.name).catch((err) => {
            console.error("Failed to send registration email:", err)
        })
    } catch (err) {
        console.error("User registration failed:", err)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

/**
 * - User Login Controller
 * - POST /api/auth/login
  */

async function userLoginController(req, res) {
    try {
        const { email, password } = req.body

        const user = await userModel.findOne({ email }).select("+password +systemUser")

        if (!user) {
            return res.status(401).json({
                message: "Email or password is INVALID"
            })
        }

        const isValidPassword = await user.comparePassword(password)

        if (!isValidPassword) {
            return res.status(401).json({
                message: "Email or password is INVALID"
            })
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" })

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 3 * 24 * 60 * 60 * 1000,
            path: '/'
        })

        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                systemUser: user.systemUser || false
            },
            token
        })
    } catch (err) {
        console.error("User login failed:", err)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}


/**
 * - User Logout Controller
 * - POST /api/auth/logout
  */
async function userLogoutController(req, res) {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[ 1 ]

        if (!token) {
            return res.status(200).json({
                message: "User logged out successfully"
            })
        }

        await tokenBlackListModel.create({
            token: token
        })

        res.clearCookie("token", {
            path: '/',
            sameSite: 'none',
            secure: process.env.NODE_ENV === 'production'
        })

        res.status(200).json({
            message: "User logged out successfully"
        })
    } catch (err) {
        console.error("User logout failed:", err)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}


module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}