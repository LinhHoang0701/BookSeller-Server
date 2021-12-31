const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const role = require("../../middleware/role");
const {
  addProduct,
  editProduct,
  getListProduct,
  getItem,
  searchProduct,
  deleteProduct,
} = require("../../controller/product");

router.post("/add", auth, role.checkRole(role.ROLES.Admin), addProduct);
router.put("/:id", auth, role.checkRole(role.ROLES.Admin), editProduct);
router.post("/list", auth, getListProduct);
router.get("/item/:slug", auth, getItem);
router.get("/list/search/:name", auth, searchProduct);
router.delete("/:id", auth, deleteProduct);

module.exports = router;
