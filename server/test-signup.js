const http = require('http');
const d = JSON.stringify({
    full_name: 'TestUser',
    email: 'final_verify_' + Date.now() + '@test.com',
    password: 'Test1234'
});
const o = {
    hostname: 'localhost', port: 3000, path: '/api/auth/signup',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': d.length }
};
const r = http.request(o, res => {
    let b = '';
    res.on('data', c => b += c);
    res.on('end', () => {
        console.log('STATUS:', res.statusCode);
        console.log('BODY:', b);
        if (res.statusCode === 201) console.log('\n✅ Signup is working!');
        else console.log('\n❌ Signup still failing');
    });
});
r.on('error', e => console.error('Request error:', e.message));
r.write(d);
r.end();
