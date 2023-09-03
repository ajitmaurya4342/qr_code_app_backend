const path = require("path");
var multer = require("multer");
const fs = require("fs");
const imageBaseURL = `http://localhost:3900`;
// uploadSingleFile
var {
  uploadSingleFile,
  uploadImage,
} = require("@/controllers/MulterHelper.js");

module.exports.uploadFile = function (req, res) {
  uploadSingleFile(req, res, function (uploadFileError) {
    if (uploadFileError) {
      res.json({ status: false, message: "uploadFileError" });
    } else {
      let SetPath = "";
      if (req.body.filePath == "Bin Numbers File") {
        SetPath = `/binnumber/`; // For Add & Edit Bin Numbers
      }

      var a = req.file.originalname;
      let file_extensions_only = a.split(/[. ]+/).pop();
      let without_ext_image_name = a.split(".").slice(0, -1).join(".");
      let without_special_char_image_name = without_ext_image_name
        .toLowerCase()
        .split(" ")
        .join("_")
        .replace(/[^a-z0-9_]/gi, "");
      var final_image_name_with_ext = without_special_char_image_name.concat(
        ".",
        file_extensions_only
      );
      req.file.originalname = final_image_name_with_ext;
      let existingFile = `${__base}/public/uploads/${req.file.filename}`;
      if (!fs.existsSync(`${__base}/public${SetPath}`)) {
        fs.mkdirSync(`${__base}/public${SetPath}`);
      }

      let og_name = req.file.originalname.split(".");
      let ext = og_name[1].toLowerCase();
      let newFileName = `${Date.now()}-${og_name[0]}.${ext}`;
      let storInto = `${SetPath}${newFileName}`;

      fs.rename(existingFile, `${__base}/public${storInto}`, (error) => {
        if (error) {
          res.json({ status: false, message: "File uploading Error", error });
        } else {
          if (false) {
            uploadToS3(SetPath, newFileName, (s3error, result) => {
              if (s3error) {
                res.json({
                  status: false,
                  message: "Image uploading Error",
                  error: s3error,
                });
              } else {
                fs.unlink(`${__base}/public${storInto}`, function (error) {});
                res.json({
                  status: true,
                  message: "Image uploaded successfully on S3",
                  path: result,
                  error: null,
                });
              }
              // console.log('result :', result);
            });
          } else {
            res.json({
              status: true,
              message: "File uploaded successfully",
              imageBaseURL,
              path: storInto,
            });
          }
        }
      });
    }
  });
};

module.exports.uploadImageController = function (req, res) {
  let galleryId = null;
  uploadImage(req, res, function (uploadImageError) {
    if (uploadImageError) {
      return res.json({
        status: false,
        message: uploadImageError,
      });
    } else {
      let SetPath = `/uploads/`;
      console.log(req.file); // For Add & Edit Cinema
      if (!req.file) {
        return res.json({
          status: false,
          message: "Please select file",
        });
      }
      if (!req.file.originalname) {
        return res.json({
          status: false,
          message: "Please select file",
        });
      }
      // console.log('req.file :', req.file);
      var a = req.file.originalname;
      let image_extensions_only = a.split(/[. ]+/).pop();
      let without_ext_image_name = a.split(".").slice(0, -1).join(".");
      let without_special_char_image_name = without_ext_image_name
        .toLowerCase()
        .split(" ")
        .join("_")
        .replace(/[^a-z0-9_]/gi, "");
      console.log(
        "without_special_char_image_name :",
        without_special_char_image_name
      );
      var final_image_name_with_ext = without_special_char_image_name.concat(
        ".",
        image_extensions_only
      );
      req.file.originalname = final_image_name_with_ext;
      // console.log(":::: req.file ::::", req.file);
      // console.log(" :: __base  :: ", __base);
      // console.log(": req.body.imagePath :", req.body.imagePath);
      // console.log(": req.file.filename :", req.file.filename);
      let checkpath = path.normalize(`${__base}/public${SetPath}`);
      console.log("checkpath :", checkpath);
      if (!fs.existsSync(checkpath)) {
        console.log("checkpath :", checkpath);
        fs.mkdirSync(checkpath);
      }

      // console.log('req.file :>> ', req.file);
      let existingFile = `${__base}/public/uploads/${req.file.filename}`;
      let og_name = req.file.originalname.split(".");
      let ext = og_name[1].toLowerCase();
      // let storInto = `${__base}/uploads/${req.file.originalname}-${Date.now()}.jpg`
      let newFileName = `${Date.now()}-${og_name[0] + "." + ext}`;
      let storInto = `${SetPath}${newFileName}`;
      // console.log("req.body.imagePath , existingFile:", existingFile);
      // console.log('object aaaaaaaaaaaaaaaa :', existingFile, storInto);
      fs.rename(
        path.normalize(existingFile),
        path.normalize(`${__base}/public${storInto}`),
        (error) => {
          if (error) {
            return res.json({
              status: false,
              message: "Image uploading Error",
              error,
            });
          } else {
            console.log("req.body :>> ", req.body);

            res.json({
              status: true,
              message: "Image uploaded successfully",
              imageBaseURL,
              path: storInto,
              fullpath: imageBaseURL + storInto,
            });
          }
        }
      );
    }
  });
};
