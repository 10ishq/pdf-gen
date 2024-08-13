import express from "express";
import fs from "fs";
import handlebars from "handlebars";
import path from "path";
import puppeteer from "puppeteer";

const app = express();

app.get("/", async (req, res) => {
    try {
        const name = "Sample Name"; // Static name for testing

        const newdate = new Date();
        const day = String(newdate.getDate()).padStart(2, "0");
        const month = String(newdate.getMonth() + 1).padStart(2, "0");
        const year = newdate.getFullYear();
        const formattedDate = `${day}.${month}.${year}`;

        const templatePath = path.resolve("./templates/sample.hbs");
        const templateSource = fs.readFileSync(templatePath, "utf-8");
        const template = handlebars.compile(templateSource);

        const html = template({ name, date: formattedDate });

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();

        await page.setContent(html);

        const pdfPath = path.resolve("./output/certificate.pdf");
        await page.pdf({
            path: pdfPath, // Save PDF to file
            format: "A4",
        });

        await browser.close();

        // Send the PDF file
        res.contentType("application/pdf");
        res.setHeader("Content-Disposition", "inline; filename=certificate.pdf");
        res.sendFile(pdfPath);
    } catch (error) {
        console.error("Error during PDF generation:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});
