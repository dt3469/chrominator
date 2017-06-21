'use strict';

const assert = require('assert');
const Driver = require('./../index').Driver;
const ChromeService = require('./../index').ChromeService;
const CDP = require('chrome-remote-interface');
const fs = require('fs');
const expect = require('chai').expect
const createMockServer = require('./../fixtures/server')

describe('core api', function() {
    const baseHtml = fs.readFileSync(__dirname + '/../fixtures/static/base.html', 'utf-8');
    const baseUrl = 'http://127.0.0.1:8080';
    var mockServer;
    var driver;
    var service;

    before(function(done) {
        mockServer = createMockServer(8080, function() {
            console.log('start mock server');

            service = new ChromeService();
            service.start().then((result) => {
                driver = result;
                done();
            });
        });
    });

    after(function() {
        console.log('stop mock server');
        mockServer.close();
        service.stop();
    });

    describe('query', function() {
        it('can query elements', function(done) {
            driver.setContent(baseHtml).then(() => {
                return driver.querySelectorAll({selector: 'div'})
            }).then((nodes) => {
                expect(nodes.length).to.be.above(1);

                done();
            }).catch((err) => {

                done(err);
            });
        });

        it('can query element', function(done) {
            var outerNode;
            driver.setContent(baseHtml).then(() => {
                return driver.querySelector({selector: 'div#outer'})
            }).then((node) => {
                outerNode = node;
                return outerNode.getAttribute('class');
            }).then((value) => {
                expect(value).to.equal('outer');
                return outerNode.getAttributes();
            }).then((attrs) => {
                expect(attrs).to.deep.equal({id: 'outer', class: 'outer'});

                done();
            }).catch((err) => {

                done(err);
            });
        });

        it('can query element from node', function(done) {
            driver.setContent(baseHtml).then(() => {
                return driver.querySelector({selector: 'div#outer'})
            }).then((node) => {
                return node.querySelector({selector: 'div#inner'});
            }).then((node) => {
                return node.getAttribute('class');
            }).then((value) => {
                expect(value).to.equal('inner');

                done();
            }).catch((err) => {

                done(err);
            });
        });
    });

    it('can query elements from node', function(done) {
        driver.setContent(baseHtml).then(() => {
            return driver.querySelector({selector: 'div#outer'})
        }).then((node) => {
            return node.querySelectorAll({selector: 'div'});
        }).then((nodes) => {
            expect(nodes.length).to.be.above(1);

            done();
        }).catch((err) => {

            done(err);
        });

        it('can navigate to google.com', function(done) {
            driver.navigate({url: 'https://www.google.com'}).then(() => {
                return driver.querySelector({selector: 'input[name="q"]'})
            }).then(() => {
                client.close();
                done();
            }).catch((err) => {

                client.close();
                done(err);
            });
        });
    });

    it('can click an element', function(done) {
        driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
            return driver.querySelector({selector: 'div#inner'})
        }).then((node) => {
            return node.click();
        }).then(() => {
            return driver.querySelector({selector: 'div#innerClick'})
        }).then(() => {
            done();
        }).catch((err) => {

            done(err);
        });
    });

    it('can send keys to an element', function(done) {
        var inputElem;
        var name = 'naru';
        driver.navigate({url: baseUrl + '/input.html'}).then(() => {
            return driver.querySelector({selector: 'input#name'})
        }).then((node) => {
            inputElem = node;
            return inputElem.sendKeys(name);
        }).then((node) => {
            return inputElem.getProperty('value');
        }).then((value) => {
            expect(value).to.equal(name);
        }).then(() => {
            done();
        }).catch((err) => {

            done(err);
        });
    });
});
