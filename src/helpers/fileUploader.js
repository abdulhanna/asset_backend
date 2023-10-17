import multer from "multer";
import path from "path";
const storage = multer.diskStorage({
    destination: "public/uploads",
    filename: (req, file, cb) => {
        return cb(
            null,
            `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
        );
    },
});
const uploader = multer({
    storage: storage,
});
export default uploader

