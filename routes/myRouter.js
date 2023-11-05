const express = require('express')
const router = express.Router()
// เรียกใช้งาน Model
const Product = require('../models/products')
//อัพโหลดไฟล์
const multer = require('multer')
const session = require('express-session')

const storage = multer.diskStorage({
    destination:function(req, file, cb) {
        cb(null, './public/images/products')//ตำแหน่งจัดเก็บไฟล์
    },
    filename:function(req, file, cb) {
        cb(null, Date.now()+".jpg")//เปลี่ยนชื่อไฟล์ ป้องกันไม่ให้ซ้ำกัน
    }
})


//เริ่มต้น upload
const upload = multer({
    storage:storage
})
router.get('/', async (req, res) => {
    // Product.find().exec((err, doc) => {
    //     res.render('index', {products:doc})
    // })

    // Product.find({}).exec().then((doc) => {
    //     res.render('index', {products:doc})
    // })
    try {
        let doc = await Product.find({}).exec();
        res.render('index', {products:doc})
    } catch (err) {
        console.log(err)
    }
    

    // const products = [
    //     {name: "โน๊ตบุ๊ค", price: 25000, image:"images/products/product1.png"},
    //     {name: "เสื้อผ้า", price: 250, image:"images/products/product2.png"},
    //     {name: "หูฟัง", price: 3500, image:"images/products/product3.png"},
    // ]
    // res.render('index', {products:products})
})

router.get('/add-product', (req, res) => {
    if(req.session.login) {
        res.render('form')
    } else {
        res.render('admin')
    }
})

router.get('/manage', async (req, res) => {
    if (req.session.login) {
        try {
            let doc = await Product.find({}).exec();
            res.render('manage', {products:doc})
        } catch (err) {
            console.log(err)
        }
    } else {
        res.render('admin') //เข้าสู่ระบบ
    }
    
})

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/manage')
    })
})

router.get('/delete/:id', async(req, res) => {
    // await Product.findByIdAndDelete(req.params.id)
    //     res.redirect('/manage')
    // })
    try {
        await Product.findByIdAndDelete(req.params.id)
    } catch (err) {
        console.log(err)
    }
    res.redirect('/manage')
    // try {
    //     let doc = await Product.find({})
    //     res.render('manage', {products:doc})
    // } catch (err) {
    //     console.log(err)
    // }
})

router.get('/:id', async (req, res) => {
    try {
        const product_id = req.params.id;
        console.log(product_id);
        const doc = await Product.findOne({ _id: product_id }).exec();
        res.render('product', { product: doc });
    } catch (err) {
        console.error(err);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลผลิตภัณฑ์');
    }
});

// router.get('/:id', async (req, res) => {
//     const product_id = req.params.id
//     try {
//         let doc = await Product.findOne({_id:product_id})
//         res.render('product', {product:doc})
//     } catch (err) {
//         console.log(err)
//     }
// })

router.post('/insert', upload.single("image"), (req, res) => {
    let data = new Product({
        name:req.body.name,
        price:req.body.price,
        image:req.file.filename,
        description:req.body.description,
    })
    try {
        Product.saveProduct(data)
    } catch(err) {
        console.log(err)
    }
    res.redirect('/')
})

router.post('/edit', async(req, res) => {
    const edit_id = req.body.edit_id
    try {
        let doc = await Product.findOne({_id:edit_id}).exec();
        //นำข้อมูลเดิมไปแก้ไขในแบบฟอร์ม
        res.render('edit', {product:doc})
    } catch (err) {
        console.log(err)
    }
})

router.post('/update', async(req, res) => {
    const update_id = req.body.update_id
    let data = ({
        name:req.body.name,
        price:req.body.price,
        description:req.body.description,
    })
    try {
        await Product.findByIdAndUpdate(update_id, data, {useFindAndModify:false})
        res.redirect('/manage')
    } catch (err) {
        console.log(err)
    }
})

router.post('/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    const timeExpire = 30000 // 30วิ

    if(username === "admin" && password === "123") {
        // res.cookie('username', username, {maxAge:timeExpire})
        // res.cookie('password', password, {maxAge:timeExpire})
        // res.cookie('login', true, {maxAge:timeExpire}) //true = login เข้าระบบ
        req.session.username = username
        req.session.password = password
        req.session.login = true
        req.session.cookie.maxAge = timeExpire
        res.redirect('/manage')
    } else {
        res.render('404')
    }
})



module.exports = router