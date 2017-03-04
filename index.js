'use strict';

const config = require('./config.json');
const flip = require('flip')
const request = require('request')

function verifyWebhook(body) {
  if (!body || body.token !== config.SLACK_TOKEN) {
    const error = new Error('Invalid credentials');
    error.code = 401;
    throw error;
  }
}

function makePayload(body) {

    const channel = body.channel_name === 'directmessage' ?
        body.channel_id : '#' + body.channel_name;

    const text = body.text ? flip(body.text) : '┻━┻';

    var payload = {
            channel: channel,
            text: '(╯°□°）╯︵ ' + text,
            icon_emoji: ':rage1:'
          };

    if (config.NO_RAGE) {
        delete payload.icon_emoji;
    }

    return payload;
}

exports.tableFlip = function tableFlip(req, res) {
    return Promise.resolve().then(() => {
        if (req.method !== 'POST') {
            const error = new Error('Only POST requests are accepted');
            error.code = 405;
            throw error;            
        }

        verifyWebhook(req.body);

        return makePayload(req.body);
    }).then((response) => {
        request.post({
            url: config.SLACK_WEBHOOK,
            form: { payload: JSON.stringify(payload) }
        }, function (err, resp, body) {
            if (err) {
                const error = new Error('{ success: false, error: err.message }');
                error.code(500);
                throw error;
            }
        })
    }).catch((err) => {
      console.error(err);
      res.status(err.code || 500).send(err);
      return Promise.reject(err);        
    });
};