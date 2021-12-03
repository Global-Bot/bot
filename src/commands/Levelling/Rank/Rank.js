const Command = require('../../../core/classes/Command');
const { MessageAttachment } = require( 'discord.js' );
const path = require('path');

const { createCanvas, loadImage, registerFont } = require( 'canvas' );

const BebasNeue = path.join(__dirname, 'Fonts', 'BebasNeue-Regular.ttf');
registerFont(BebasNeue, { family: 'BebasNeue' });

const canvasWidth = 902, canvasHeight = 600;
const canvas = createCanvas( canvasWidth, canvasHeight );
const ctx = canvas.getContext('2d');

const actual = z => (z * 41) / 33
const sizeText = (text, fontsize = actual(25), maxWidth = canvas.width) => {
    do {
        fontsize -= 5;
        ctx.font = actual(fontsize) + 'px BebasNeue';
    } while( ctx.measureText( text ).width > maxWidth );

    return ctx.font;
}

class Rank extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'rank';
        this.group        = 'Levelling';
        this.aliases      = [];
        this.description  = 'Displays rank card with levelling information';
        this.usage        = 'rank (user)';
        this.expectedArgs = 0;
        this.cooldown     = 5000;

        this.white = '#FFFFFF';
        this.blue  = '#0c2176';
        this.progressBarColour = '#f24b65';
        this.starCountColour = '#eaac27';

        this.background    = path.join(__dirname, 'Images', 'Background.png');
        this.progressBar   = path.join(__dirname, 'Images', 'ProgressBar.png');
        this.currentXP     = path.join(__dirname, 'Images', 'CurrentXP.png');
        this.requiredXP    = path.join(__dirname, 'Images', 'RequiredXP.png');
        this.genderNotSet  = path.join(__dirname, 'Images', 'GenderNotSet.png');
        this.countryNotSet = path.join(__dirname, 'Images', 'CountryNotSet.png');
        this.genderMale    = path.join(__dirname, 'Images', 'GenderMale.png');
        this.genderFemale  = path.join(__dirname, 'Images', 'GenderFemale.png');
        this.genderOther   = path.join(__dirname, 'Images', 'GenderOther.png');
        this.starCount     = path.join(__dirname, 'Images', 'StarCount.png');
    }

    async execute({ message, guild, args }) {
        const user = this.resolveUser(guild, args[0]) || message.member;
        if (!user) return this.error(message.channel, 'Failed to find that user');

        const levelling    = user.levelling;

        const economy      = await user.economy;
        if(economy.errored) return this.error(message.channel, "A system error has occured", "Unable to retrieve economy data");

        const reputation   = await user.reputation;
        if(reputation.errored) return this.error(message.channel, "A system error has occured", "Unable to retrieve economy data");

        const gender       = user.gender;
        const userGender   = await gender.get();

        const country      = user.country;
        const userCountry  = await country.get();

        const about        = user.about;
        const userAbout    = await about.get();



        await this.drawBackgroundImage(ctx);
        await this.drawProgressBarImage(ctx, levelling);
        await this.drawCurrentXPImage(ctx);
        await this.drawRequiredXPImage(ctx);
        await this.drawStarCountImage(ctx);


        await this.drawGender(ctx, userGender)
        await this.drawCountry(ctx, userCountry)


        this.drawTag(ctx, user);
        await this.drawLevel(ctx, levelling);


        await this.drawAvatar(ctx, user);

        await this.drawXPBoost(ctx, levelling);
        await this.drawStarBoost(ctx, levelling);
        
        await this.drawStarCount(ctx, economy);
        
        await this.drawAbout(ctx, userAbout);

        await this.drawReps(ctx, reputation);


        // Send
        this.sendMessage(message.channel, { files: [
            new MessageAttachment(canvas.toBuffer(), `${this.fullName(user)}_rank_card-${this.client.user.username}.png`)
        ] })
    }

    async drawBackgroundImage(ctx) {
        const background = await loadImage(this.background);
        ctx.drawImage(background, 0, 0, canvasWidth, canvasHeight);
    }

    async drawProgressBarImage(ctx, levelling) {
        const userXP    = await levelling.getXP();
        const userLevel = levelling.getXPLevel(userXP);

        const currentXP   = userXP - levelling.getLevelXP(userLevel);
        const requiredXP  = levelling.getLevelXP(userLevel + 1);

        
        const x      = 45;
        const y      = 209;
        const radius = 10;
        const width  = ((((currentXP / requiredXP) * 100) * 585) / 100);
        const height = 38;

        ctx.save();
        this.roundedImage(ctx, x, y, width, height, radius);
        ctx.clip();

        ctx.fillStyle = this.progressBarColour;
        ctx.fillRect(x, y, width, height);

        ctx.restore();


        // Current XP
        ctx.globalAlpha = 0.53;
        ctx.font = sizeText(currentXP.toLocaleString(), actual(23), 250);
        ctx.fillStyle = this.white;
        ctx.fillText(currentXP.toLocaleString(), 216, 238);
        ctx.globalAlpha = 1;


        // Required XP
        ctx.globalAlpha = 0.53;
        ctx.font = sizeText(requiredXP.toLocaleString(), actual(23), 70);
        ctx.fillStyle = this.white;
        ctx.fillText(requiredXP.toLocaleString(), 555, 238);
        ctx.globalAlpha = 1;
    }

    async drawCurrentXPImage(ctx) {
        const currentXP = await loadImage(this.currentXP);
        ctx.drawImage(currentXP, 0, 0, canvasWidth, canvasHeight);
    }

    async drawRequiredXPImage(ctx) {
        const requiredXP = await loadImage(this.requiredXP);
        ctx.drawImage(requiredXP, 0, 0, canvasWidth, canvasHeight);
    }


    async drawGender(ctx, userGender) {
        let genderImage;
        switch (userGender) {
            case 'Male':
                genderImage = this.genderMale;
                break;

            case 'Female':
                genderImage = this.genderFemale;
                break;

            case 'Other':
                genderImage = this.genderOther;
                break;

            case undefined:
            case null:
                genderImage = this.genderNotSet;
                break;
        }

        if (genderImage) {
            ctx.drawImage(await loadImage(genderImage), 0, 0, canvasWidth, canvasHeight);
        } else {
            const text = userGender;

            ctx.font = sizeText(text, actual(27), canvasWidth - 700);
            ctx.fillStyle = this.white;
            ctx.fillText(text, 700, 85);
        }
    }
    
    async drawStarCountImage(ctx) {
        const starCount = await loadImage(this.starCount);
        ctx.drawImage(starCount, 0, 0, canvasWidth, canvasHeight);
    }

    async drawCountry(ctx, userCountry) {
        let countryImage;

        if (userCountry) {
            const countryData  = this.global.countryData.find(c => c?.name?.toLowerCase() == userCountry?.toLowerCase() || c?.code?.toLowerCase() == userCountry?.toLowerCase());
            if (countryData?.flag) {
                countryImage = countryData?.flag;

                const text = countryData.name;

                ctx.font = sizeText(text, actual(25), canvasWidth - 751);
                ctx.fillStyle = this.white;
                ctx.fillText(text, 751, 117);
            }
        }

        if (!countryImage) {
            countryImage = this.countryNotSet;
        }

        const x = countryImage == this.countryNotSet ? 0 : 690;
        const y = countryImage == this.countryNotSet ? 0 : 92;
        const w = countryImage == this.countryNotSet ? canvasWidth : 54;
        const h = countryImage == this.countryNotSet ? canvasHeight : 28;

        ctx.drawImage(await loadImage(countryImage), x, y, w, h);
    }

    drawTag(ctx, user) {
        const text = user.user.tag;

        ctx.font = sizeText(text, actual(33), 500);
        ctx.fillStyle = this.white;
        ctx.fillText(text, 219, 135);
    }

    async drawLevel(ctx, levelling) {
        const userXP       = await levelling.getXP();
        const text         = levelling.getXPLevel(userXP);

        ctx.font = sizeText(text.toLocaleString(), actual(27), canvasWidth - 284);
        ctx.fillStyle = this.white;
        ctx.fillText(text.toLocaleString(), 284, 88);
    }

    async drawAvatar(ctx, user) {
        const avatarURL = user.user.avatarURL({
            format: 'png',
            size: 4096
        });

        if (avatarURL) {
            const avatar = await loadImage(avatarURL);
            const x = 40;
            const y = 21;
            const radius = 20;
            const width = 161;
            const height = 161;
            
            
            ctx.save();
            this.roundedImage(ctx, x, y, width, height, radius);
            ctx.clip();

            ctx.fillStyle = this.blue;
            ctx.fillRect(x, y, width, height);

            ctx.drawImage(avatar, x, y, width, height);
            ctx.restore();
        }
    }

    roundedImage(ctx, x, y, width, height, radius){
        ctx.beginPath();
        ctx.moveTo(x + radius, y);

        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        
        ctx.closePath();
    }

    async drawXPBoost(ctx, levelling) {
        const XPBoost = await levelling.XPBoost();

        const text = `${XPBoost}x`;
        const pos = 674 - (7 * (XPBoost.toString().length));

        ctx.globalAlpha = 0.53;
        ctx.font = sizeText(text, actual(15), 50);
        ctx.fillStyle = this.white;
        ctx.fillText(text, pos, 236);
        ctx.globalAlpha = 1;
    }

    async drawStarBoost(ctx, levelling) {
        const starBoost = await levelling.XPBoost();

        const text = `${starBoost}x`;
        const pos = 740 - (7 * (starBoost.toString().length));

        ctx.globalAlpha = 0.53;
        ctx.font = sizeText(text, actual(15), 50);
        ctx.fillStyle = this.white;
        ctx.fillText(text, pos, 236);
        ctx.globalAlpha = 1;
    }


    async drawStarCount(ctx, economy) {
        const text = economy.stars.toLocaleString();

        ctx.font = sizeText(text, actual(28), 500);
        ctx.fillStyle = this.starCountColour;
        ctx.fillText(text, 260, 283);
    }


    async drawAbout(ctx, userAbout) {
        if (!userAbout) userAbout = `Your about is not set.
        
        \nUse ${this.config.prefix}about to set your about.`;

        let y = 438;
        let count = 0;

        for (const row of userAbout.match(/.{1,42}/g)) {
            for (let str of row.split("\\n")) {
                if (count >= 6) break;

                if (str.startsWith(" ")) {
                    str = str.slice(1);
                }

                ctx.globalAlpha = 0.53;
                ctx.font = `${actual(20)}px BebasNeue`;
                ctx.fillStyle = this.white;
                ctx.fillText(str, 77, y);
                ctx.globalAlpha = 1;

                count += 1;
                y += 25;
            }
        }
    }

    async drawReps(ctx, reputation) {
        const text = reputation.reputation.toLocaleString();

        ctx.globalAlpha = 0.53;
        ctx.font = sizeText(text, actual(26), 50);
        ctx.fillStyle = this.white;
        ctx.fillText(text, 821, 400);
        ctx.globalAlpha = 1;
    }
}

module.exports = Rank;
