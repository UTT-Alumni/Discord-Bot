# Discord-Bot
The best discord bot ever to manage user onboarding.

## Details
The bot display the rules on an empty channel. If the channel is not empty,
no message is post.

![Rules example](assets/rules-example.png)

When the user accept the rules, a modal ask some information about the user.

![Modal example](assets/modal-example.png)

Once the user validate the modal, its nickname is updated, a role is
given to him, and an ephemeral welcome message is displayed (just for him).

## Configuration
### Discord developer settings
On your Discord user settings, activate the developer settings in the advanced section. It will
allow you to access channel and role IDs.

### Connect to the server
To set up the bot, edit the config.json file:
- token: the token to log the bot to your server
- server: the server ID. You can find it in the Widget section of your server's settings.
- channel: the channel where the bot display the rules. On the channel list, right-click on the channel and copy its ID.
- role: the role to add to the user once he accepts the rules and submits the modal. In the role list, right-click on the role and copy its ID.

### Discord server settings
Thi bot gives permissions to other users. Discord has a non-intuitive way of allowing permissions. The role
of the bot must be in a higher position in the role list than the role it will give.

For example, if the bot has the role "bot-role", and that the roles "role1", "role2" and "role3"
exist, and if the bot gives the role2 role to the user, the bot-role must be above role2, as in this example:

![Role list](assets/role-list.png)



## Develop
To run the bot:
- `npm install`
- `npm start` or `npm run start-dev` for loading a local `config-dev.json` file.
