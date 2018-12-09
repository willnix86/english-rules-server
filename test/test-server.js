const chai = require('chai');
const chaiHttp = require('chai-http');

const { app } = require('../server');

const should = chai.should();
chai.use(chaiHttp);

function getRequest() {
    return chai.request(app)
        .get('/api/foooo')
};

describe('API', () => {

    it('should 200 on GET requests', async function() {
        let res = await getRequest();
        res.should.have.status(200);
        res.should.be.json;
    });

});