
'use strict'

const assert = require('assert')
const Driver = require('./../index').Driver
const Node = require('./../lib/core').Node
const ExpectedConditions = require('./../index').ExpectedConditions
const ChromeService = require('./../index').ChromeService
const CDP = require('chrome-remote-interface')
const fs = require('fs')
const expect = require('chai').expect
const createMockServer = require('./../fixtures/server')

describe('evaluate api', function () {
    const baseHtml = fs.readFileSync(__dirname + '/../fixtures/static/base.html', 'utf-8')
    const baseUrl = process.env.CHROMINATOR_MOCK_SERVER_BASE_URL
    var driver
    var service

    before(function (done) {
        service = new ChromeService()
        service.start().then((result) => {
            driver = result
            done()
        })
    })

    after(function (done) {
        service.stop().then(() => {
            done()
        })
    })


    it('evaluate can return number', function (done) {
        driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
            return driver.evaluate({functionDeclaration: function () { return 1 }})
        }).then((result) => {
            expect(result).to.equal(1)
        }).then(() => {
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it('evaluate can return decimal number', function (done) {
        driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
            return driver.evaluate({functionDeclaration: function () { return 1.0 }})
        }).then((result) => {
            expect(result).to.equal(1.0)
        }).then(() => {
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it('evaluate can handle string function', function (done) {
        driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
            return driver.evaluate({functionDeclaration: 'return 1'})
        }).then((result) => {
            expect(result).to.equal(1)
        }).then(() => {
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it('evaluate can return boolean', function (done) {
        driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
            return driver.evaluate({functionDeclaration: function () { return true }})
        }).then((result) => {
            expect(result).to.be.true
        }).then(() => {
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it('evaluate can return string', function (done) {
        driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
            return driver.evaluate({functionDeclaration: function () { return 'foo' }})
        }).then((result) => {
            expect(result).to.equal('foo')
        }).then(() => {
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it('evaluate can return null', function (done) {
        driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
            return driver.evaluate({functionDeclaration: 'return null;'})
        }).then((result) => {
            expect(result).to.be.null
        }).then(() => {
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it('evaluate can return undefined', function (done) {
        driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
            return driver.evaluate({functionDeclaration: 'return undefined;'})
        }).then((result) => {
            expect(result).to.be.undefined
        }).then(() => {
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it('evaluate can return date', function (done) {
        driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
            return driver.evaluate({functionDeclaration: 'return new Date();'})
        }).then((result) => {
            expect(result).to.be.an.instanceof(Date)
            // TODO handle timezone properly ... nodejs is not parsing the tz properly
        }).then(() => {
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it('evaluate can handle function with numeric argument', function (done) {
        driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
            return driver.evaluate({functionDeclaration: function (name) { return name }, args: [1]})
        }).then((result) => {
            expect(result).to.equal(1)
        }).then(() => {
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it('evaluate can handle function with boolean argument', function (done) {
        driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
            return driver.evaluate({functionDeclaration: function (name) { return name }, args: [true]})
        }).then((result) => {
            expect(result).to.be.true
        }).then(() => {
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it('evaluate can handle function with string argument', function (done) {
        const name = 'jesg'
        driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
            return driver.evaluate({functionDeclaration: function (name) { return name }, args: [name]})
        }).then((result) => {
            expect(result).to.equal(name)
        }).then(() => {
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it('evaluateAsync can resolve primitive', function (done) {
        driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
            return driver.evaluateAsync({functionDeclaration: function () { resolve(1) }})
        }).then((result) => {
            expect(result).to.equal(1)
        }).then(() => {
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it('evaluateAsync can resolve setTimeout', function (done) {
        driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
            return driver.evaluateAsync({functionDeclaration: function () { setTimeout(function () { resolve(1) }, 10) }})
        }).then((result) => {
            expect(result).to.equal(1)
        }).then(() => {
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it('node evaluate can get class attribute', function (done) {
        driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
            return driver.querySelector({selector: 'div#inner'})
        }).then((node) => {
            return node.evaluate({functionDeclaration: function () { return this.getAttribute('class') }})
        }).then((result) => {
            expect(result).to.equal('inner')
        }).then(() => {
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it('node arg evaluate can get class attribute', function (done) {
        driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
            return driver.querySelector({selector: 'div#inner'})
        }).then((node) => {
            return driver.evaluate({functionDeclaration: function (node) { return node.getAttribute('class') }, args: [node]})
        }).then((result) => {
            expect(result).to.equal('inner')
        }).then(() => {
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it('node evaluateAsync can resolve setTimeout', function (done) {
        driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
            return driver.querySelector({selector: 'div#inner'})
        }).then((node) => {
            return node.evaluateAsync({functionDeclaration: function () { setTimeout(function () { resolve(1) }, 10) }})
        }).then((result) => {
            expect(result).to.equal(1)
        }).then(() => {
            done()
        }).catch((err) => {
            done(err)
        })
    })

    xit('switch to frame and return document body', function(done) {
    })

    it('create a persistent value', function (done) {
        driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
            return driver.evaluate({functionDeclaration: function () { document.alerts = [] }})
        }).then(() => {
            return driver.evaluate({functionDeclaration: function () { document.alerts.push('hello') }})
        }).then(() => {
            return driver.evaluate({functionDeclaration: function () { return document.alerts.shift() }})
        }).then((result) => {
            expect(result).to.equal('hello')
        }).then(() => {
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it('can return document element', function (done) {
        driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
            return driver.evaluate({functionDeclaration: function () { return document }})
        }).then((result) => {
            expect(result).to.not.be.null
            expect(result).to.be.an.instanceof(Node)
        }).then(() => {
            done()
        }).catch((err) => {
            done(err)
        })
    })

    it('does not freez when exception is thrown', function (done) {
        driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
            return driver.evaluate({functionDeclaration: function () { throw new Error('bang!') }})
        }).catch((err) => {
            done()
        })
    })

    it('eval async does not freez when exception is thrown', function (done) {
        driver.navigate({url: baseUrl + '/clickable.html'}).then(() => {
            return driver.evaluateAsync({functionDeclaration: function () { throw new Error('bang!') }})
        }).catch((err) => {
            done()
        })
    })

    it('eval async can timeout', function (done) {
      driver.navigate({url: baseUrl + '/base.html'}).then(() => {
        return driver.evaluateAsync({functionDeclaration:
                                    function () {
          setTimeout(function() { resolve() }, 10000)
        },
        timeout: 1000
        })
      }).then(() => {
        done(new Error('this test should throw an error'))
      }).catch((err) => {
        done()
      })
    })

    it('eval async timeout can be set globally', function (done) {
      driver.timeouts.script = 1000
      driver.navigate({url: baseUrl + '/base.html'}).then(() => {
        return driver.evaluateAsync({functionDeclaration:
                                    function () {
          setTimeout(function() { resolve() }, 10000)
        }
        })
      }).then(() => {
        done(new Error('this test should throw an error'))
      }).catch((err) => {
        done()
      })
    })

    xit('eval can timeout', function (done) {
    })

})

