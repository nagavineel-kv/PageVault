// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// const protectRoute = async(req, res, next) => {
//     try {
//         //Get Token
//         const token = req.header("Authorization").replace("Bearer ", "");
//         if(!token) return res.status(401).json({message:"No authentication code, access denied!"});
//         //Verify token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         //Find User
//         const user = await User.findById(decoded.userID).select("-password");
//         if(!user) return res.status(401).json({message:"Token is not valid"});
//         req.user = user;
//         next();
//     } catch (error) {
//         console.error("Authentication error: ", error.message);
//         res.status(401).json({message:"Token is not valid!"});
//     }
// }
// export default protectRoute;
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectRoute = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No authentication code, access denied!" });
        }

        const token = authHeader.replace("Bearer ", "");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded); // For debugging

        const user = await User.findById(decoded.userID).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Token is not valid!" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication error: ", error.message);
        res.status(401).json({ message: "Token is not valid!" });
    }
};

export default protectRoute;
