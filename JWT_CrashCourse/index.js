const express = require("express")

const app = express();
// app.use(bodyParser.json());
app.use(express.json())

app.use('/auth', require("./routes/auth"))
app.use('/posts', require("./routes/post"))


app.listen(3006);