const IncomingWebhook = require('@slack/client').IncomingWebhook;
const SnooStream = require('snoostream');
const fs = require('fs');

const creds = require('./creds');

const url = creds.slackWebookUrl;

const webhook = new IncomingWebhook(url);

let snooStream = SnooStream({
    userAgent: 'josh@trtr.co',
    clientId: creds.clientId,
    clientSecret: creds.clientSecret,
    refreshToken: creds.refreshToken
});

const RATE = 5 * 1000;

const sub = subreddit => snooStream.commentStream(subreddit, { rate: RATE });

let commentStream = sub('destinythegame');
// let commentStream2 = sub('destiny2');

function onComment(comment, match) {
    fs.writeFileSync(
        `./comments/${comment.id}.json`,
        JSON.stringify(comment, null, 2)
    );

    if (comment.body.includes('destinysets')) {
        const url = `https://www.reddit.com${comment.permalink}?context=3`;
        console.log('*****');
        console.log(comment.body);
        console.log(url);

        const msg = {
            username: 'reddit-mention',
            channel: '#destiny-plumbing',
            icon_url:
                'https://vignette2.wikia.nocookie.net/siivagunner/images/0/07/Reddit_icon.svg/revision/latest?cb=20160623172208',
            text: `New comment mentioning destinysets on /r/${comment.subreddit
                .display_name}`,
            attachments: [
                {
                    text: comment.body,
                    author_name: comment.link_title,
                    author_link: url
                }
            ]
        };

        webhook.send(msg, function(err, res) {
            if (err) {
                console.log('Error:', err);
            } else {
                console.log('Message sent: ', res);
            }
        });
    }
}

commentStream.on('post', onComment);
// commentStream2.on('post', onComment);
