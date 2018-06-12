const router = express.Router()

router.get('/steam',
    passport.authenticate('steam', { failureRedirect: '/auth/failure' }),
    function(req, res) {
        console.log('auth success')
        res.redirect('/');
    });
    
    router.get('/steam/return',
    passport.authenticate('steam', { failureRedirect: '/auth/failure' }),
    function(req, res) {
        console.log(res.req.user);
        console.log('return route')
        res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
}

module.exports = router