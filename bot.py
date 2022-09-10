import os
from xmlrpc.client import SERVER_ERROR

import discord
from discord.ui import InputText, Modal
from discord.ext import commands

from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv('DISCORD_TOKEN')
ROLE_TO_ATTRIBUTE = os.getenv('ROLE_TO_ATTRIBUTE')
SERVER_ID = os.getenv('SERVER_ID')
bot = discord.Bot()

servers = [SERVER_ID]

intents = discord.Intents.default()
intents.members = True

bot = commands.Bot(intents=intents)

@bot.event
async def on_ready():
    print(f"We have logged in as {bot.user}")

@bot.event
async def on_member_join(member):
  channel = member.guild.system_channel
  if channel is not None:
    await test(channel)


class MyModal(Modal):
    def __init__(self, user) -> None:
        super().__init__(title="Bienvenue")
        self.user = user
        self.add_item(InputText(label="Votre prénom", placeholder="", min_length=1, max_length=16)) 
        self.add_item(InputText(label="Votre nom", placeholder="", min_length=1, max_length=16)) 
        self.add_item(InputText(label="Votre année de diplôme", placeholder="", min_length=4, max_length=4)) 
        self.add_item(InputText(label="Votre branche (effective ou attendue)", placeholder="", min_length=2, max_length=5))
    async def callback(self, interaction: discord.Interaction):

        userFirstName = self.children[0].value # 1 min + 16 max char
        userName = self.children[1].value # 1 min + tronqué si prénom + nom > 17
        userYear = self.children[2].value
        userBranch = self.children[3].value
        variableLen = len(userFirstName) + len(userName) + len(userBranch)
        if variableLen > 24:
          userName = userName[:variableLen-24]+"."
        print(userFirstName+" "+userName+" - "+userYear+" "+userBranch)
        await self.user.edit(nick=userFirstName+" "+userName+" - "+userYear+" "+userBranch)
        var = discord.utils.get(self.user.guild.roles, name = ROLE_TO_ATTRIBUTE)
        await self.user.add_roles(var)
        await interaction.response.send_message(content="Bienvenue "+userFirstName+" "+userName+" sur le serveur UTT Alumni.", ephemeral=True)
        

@bot.slash_command(guild_ids = servers, name= "modal")
async def test(ctx):
    modal = MyModal(ctx.author)
    res = await ctx.interaction.response.send_modal(modal)


bot.run(TOKEN)