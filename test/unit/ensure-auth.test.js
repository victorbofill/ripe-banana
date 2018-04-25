const { assert } = require('chai');
const createEnsureAuth = require('../../lib/util/ensure-auth');
const tokenService = require('../../lib/util/token-service');

describe('auth middleware', ()=> {
    const user = { _id: 12345 };
    let token = '';
    beforeEach(() => token = tokenService.sign(user));

    const ensureAuth = createEnsureAuth();

    it('adds payload as req.user on success', done => {
        const req = {
            get(header) {
                if(header === 'Authorization') return token;
            }
        };

        const next = () => {
            assert.equal(req.user.id, user._id);
            done();
        };

        ensureAuth(req, null, next);
    });

    it('calls next with error when token is bad', done => {
        const req = {
            get() { return 'bad-token'; }
        };

        const next = err => {
            assert.equal(err.status, 401);
            done();
        };

        ensureAuth(req, null, next);
    });
});