const CheckValidation = require("@/lib/CheckValidation").checkValidation;
const pagination = require("@/lib/pagination").pagination;
const QRCode = require("@/lib/qrCodeGenerator").createQRCode;
const fpe = require("node-fpei");
const cipher = fpe({ password: "this_is_mypass" });

function generateRandom(date) {
  let now = date ? new Date(date).getTime().toString() : Date.now().toString();

  // pad with additional random digits
  if (now.length < 14) {
    const pad = 14 - now.length;
    now += randomNumber(pad);
  }
  now = cipher.encrypt(now);

  // split into xxxx-xxxxxx-xxxx format
  return [now.slice(0, 4), now.slice(4, 10), now.slice(10, 14)].join("-");
}

function randomNumber(length) {
  return Math.floor(
    Math.pow(10, length - 1) +
      Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1)
  ).toString();
}

var _ = require("lodash");
module.exports.loginUser = async function (req, res, next) {
  console.log("dasdasd");
  const reqbody = req.body;
  const checkFeild = ["user_name", "password"];
  const checkValidation = await CheckValidation(checkFeild, reqbody);
  if (!checkValidation.status) {
    return res.send(checkValidation);
  }
  const checkUserExist = await global
    .knexConnection("users")
    .where({ password: reqbody.password })
    .andWhere((builder) => {
      builder.where("username", "=", reqbody.user_name);
    });

  if (checkUserExist.length > 0) {
    return res.send({
      message: "Login Successfully",
      status: true,
      Records: checkUserExist,
    });
  } else {
    return res.send({ message: "Invalid Credential User", status: false });
  }
};

module.exports.getUserList = async function (req, res, next) {
  const reqbody = { ...req.params, ...req.body };
  const qr_user_id = reqbody.qr_user_id;
  const limit = req.query.limit ? req.query.limit : 100;
  const currentPage = req.query.currentPage ? req.query.currentPage : 1;
  const checkFeild = [];
  const checkValidation = await CheckValidation(checkFeild, reqbody);

  if (!checkValidation.status) {
    return res.send(checkValidation);
  }

  const checkUserExist = await global
    .knexConnection("qr_code_users")
    .select("all_data", "unique_code_generate", "is_active")
    .where((builder) => {
      if (qr_user_id) {
        builder.where("unique_code_generate", "=", qr_user_id);
      }
      if (req.query.search) {
        builder.whereRaw(` all_data like '%${req.query.search}%'`);
      }
    })
    .orderBy("q_user_id", "desc")
    .paginate(pagination(limit, currentPage));

  if (checkUserExist.data.length) {
    checkUserExist.data.map((z) => {
      z["all_data"] = JSON.parse(z.all_data);
    });
  }

  let defaultFieldsArray = [
    {
      label: "Full Name",
      key: "name",
      inputType: "text",
      vModelValue: "",
    },
    {
      label: "Photo",
      key: "photo",
      inputType: "file",
      vModelValue: "",
    },
    {
      label: "Date of Birth",
      inputType: "date",
      key: "dob",
      vModelValue: "",
    },
    {
      label: "Gender",
      key: "gender",
      inputType: "select",
      selectOptions: ["Male", "Female"],
      vModelValue: "",
    },
    {
      label: "Mobile No.",
      key: "mobile",
      inputType: "text",
      vModelValue: "",
    },
    {
      label: "Address",
      key: "address",
      inputType: "quill",
      vModelValue: "",
    },
    {
      label: "Height",
      key: "height",
      inputType: "text",
      vModelValue: "",
    },
    {
      label: "Weight",
      key: "weight",
      inputType: "text",
      vModelValue: "",
    },
    {
      label: "Blood Group",
      key: "blood",
      inputType: "text",
      vModelValue: "",
    },

    {
      label: "Medical Details",
      key: "medicalD",
      inputType: "quill",
      vModelValue: "",
    },
    {
      label: "Contact Details",
      key: "contactD",
      inputType: "quill",
      vModelValue: "",
    },
  ];

  let errorCheckKeyValidation = [
    {
      key: "name",
      errorMessage: "Please fill the name",
    },
    {
      key: "dob",
      errorMessage: "Please select date of birth",
    },
    {
      key: "gender",
      errorMessage: "Please select gende",
    },
    {
      key: "mobile",
      errorMessage: "Please select mobile number",
    },
    {
      key: "height",
      errorMessage: "Please fill the height",
    },
    {
      key: "weight",
      errorMessage: "Please fill the weight",
    },
    {
      key: "blood",
      errorMessage: "Please fill the blood group",
    },
  ];

  return res.send({
    message: "User List",
    status: true,
    Records: checkUserExist,
    defaultFieldsArray,
    errorCheckKeyValidation,
  });
};
module.exports.addEditUsers = async function (req, res, next) {
  const reqbody = { ...req.params, ...req.body };
  const unique_code_generate = reqbody.unique_code_generate;
  const checkFeild = ["all_data"];
  const checkValidation = await CheckValidation(checkFeild, reqbody);
  if (!checkValidation.status) {
    return res.send(checkValidation);
  }

  let obj = {
    all_data: reqbody.all_data,
  };
  if (unique_code_generate) {
    await global.knexConnection("qr_code_users").update(obj).where({
      unique_code_generate,
    });
    obj["unique_code_generate"] = unique_code_generate;
  } else {
    obj["unique_code_generate"] = generateRandom();
    await global.knexConnection("qr_code_users").insert(obj);
  }
  return res.send({
    status: true,
    message: unique_code_generate
      ? " Updated Successfully"
      : "Added Successfully",
    data: { ...obj, all_data: JSON.parse(reqbody.all_data) },
  });
};
