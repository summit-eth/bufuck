'use strict';(()=>{let cfg={data(){return{current_time:new Date().getTime(),config:{contract:{abi:window.abi_contract,address:"0x3535c9dC724BDF862acf6d4B30da3e47e57a6377"},token:{abi:window.abi_token,address:"0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",}},launch_date:1635084000000,time_left:{hours:0,minutes:0,seconds:0},loaded:0};},created(){let self=this;setInterval(()=>{let c=self.countdown(self.launch_date);self.time_left={hours:c.hours,minutes:c.minutes,seconds:c.seconds},self.current_time=new Date().getTime();},1000);},methods:{countdown(end,combine=0,ms=0){if(end<100)return"No record";if(end<16e10)end*=1e3;var now=new Date().getTime();var timeleft=end-now;timeleft=timeleft<0?now-end:timeleft;if(ms!=0)return timeleft;var days=Math.floor(timeleft/(1000*60*60*24));var hours=Math.floor((timeleft%(1000*60*60*24))/(1000*60*60));var minutes=Math.floor((timeleft%(1000*60*60))/(1000*60));var seconds=Math.floor((timeleft%(1000*60))/1000);hours=(days*24)+hours;if(hours<10)hours="0"+hours;if(minutes<10)minutes="0"+minutes;if(seconds<10)seconds="0"+seconds;if(timeleft<=0)return 0;return combine==1?hours+":"+minutes+":"+seconds:{hours:hours,minutes:minutes,seconds:seconds};},prettyDate(e){if(e<100)return"No record";if(e<16e10)e*=1e3;return window.countdown(e);}}};window.App=new Vue({mixins:[cfg],el:'#App',data:{user:{ref:"0x6462951D20b4582966Fe684614FC5ceBb837472B",address:"",workers:0,claimable:0,checkpoint:0,balance:0,allowance:0},chain:{price:0,balance:0},val:{approve:10,spend:10,},notifications:[],conn:"",contract:"",token:"",instructions:false},mounted(){let self=this;let m=location.search.match(/ref=(0x[a-fA-F0-9]{40})/i);if(m){self.user.ref=self.toAddress(m[1]);document.cookie="ref="+self.user.ref+"; path=/; expires="+(new Date(new Date().getTime()+86400*365*1000)).toUTCString();};m=document.cookie.match(/ref=(0x[a-fA-F0-9]{40})/i);if(m)self.user.ref=self.toAddress(m[1]);setInterval(self.updateData,2000);self.connectWallet();self.loaded=1;},watch:{},methods:{connectWallet(){var self=this;(async()=>{try{let providerOptions={walletconnect:{package:WalletConnectProvider.default,options:{bridge:"https:\/\/bridge.walletconnect.org",rpc:{56:"https:\/\/bsc-dataseed1.binance.org",97:"https:\/\/data-seed-prebsc-1-s1.binance.org:8545"},chainId:56,network:"binance",qrcode:true,cache:true}}};let web3conn=new window.Web3Modal.default({network:"binance",providerOptions});let provider;try{provider=await web3conn.connect();}catch(e){console.log("Cannot connect to wallet");console.log(e);return;};self.conn=new Web3(provider);self.contract=await new self.conn.eth.Contract(self.config.contract.abi,self.config.contract.address);self.token=await new self.conn.eth.Contract(self.config.token.abi,self.config.token.address);let accounts=await self.conn.eth.getAccounts();self.user.address=self.toAddress(accounts[0]);self.contract.defaultAccount=self.toAddress(accounts[0]);}catch(e){console.log(e);}})();},updateData(){var self=this;if(self.conn!=""&&self.user.address!=""){(async()=>{self.user.balance=self.parseWei(await self.token.methods.balanceOf(self.user.address).call());self.chain.price=(1/(parseInt(await self.contract.methods.getBuyRate(self.toWei("10")).call())/10000)).toFixed(4);self.user.allowance=self.parseWei(await self.token.methods.allowance(self.user.address,self.config.contract.address).call());self.contract.methods.getUserInfo(self.user.address).call((e,res)=>{self.user.workers=parseInt(res._workers)/1000;self.user.claimable=self.parseWei(res._claimable);self.user.checkpoint=res._checkpoint;});self.chain.balance=self.parseWei(await self.contract.methods.getContractBalance().call());})();}},notify(title,content='',timeout=8e3){let self=this;if(content==''){content=title;title='';};self.notifications.push({expiresOn:self.current_time+timeout,title:title,content:content});for(let i=0;i<self.notifications.length;i++){if(self.notifications[i].expiresOn<=self.current_time){self.notifications.splice(i,1);i--;}}},closeNotif(index){let self=this;self.notifications.splice(index,1);},toggleInstructions(){this.instructions=!this.instructions;console.log(this.instructions);},copyRef(){let self=this;let s=document.createElement('input');s.value="https:\/\/busdfactory.com?ref="+self.user.address;document.body.appendChild(s);if(navigator.userAgent.match(/ipad|ipod|iphone/i)){s.contentEditable=true;s.readOnly=false;let range=document.createRange();range.selectNodeContents(s);let sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);s.setSelectionRange(0,999999);}else{s.select();};try{document.execCommand('copy');this.notify("Copied to clipboard",s.value);}catch(e){};s.remove();},parseWei(wei){return Web3.utils.fromWei(wei);},toWei(a){return Web3.utils.toWei(a);},toAddress(a){return Web3.utils.toChecksumAddress(a);},format(val,dec=0){if(isNaN(val))return"...";if(dec==0)dec=((val+"").split(".").length>1?(((val+"").split(".")[1].length>8)?(val>1)?4:8:((val+"").split(".")[1].length>4)?4:2):(2));return(Math.round(val*10**dec)/10**dec).toFixed(dec);},prettifyAmount(n){var ranges=[{divider:1e18,suffix:'E'},{divider:1e15,suffix:'P'},{divider:1e12,suffix:'T'},{divider:1e9,suffix:'B'},{divider:1e6,suffix:'M'},{divider:1e3,suffix:'K'}];for(var i=0;i<ranges.length;i++){if(n>=ranges[i].divider){n=Math.floor(n/(ranges[i].divider/100))/100;return n.toString()+ranges[i].suffix;}};return n.toString();},approve(){var self=this;if(parseFloat(self.val.approve)<=0)return;if(self.conn!=""&&self.user.address!=""){self.notify("Approve BUSD","Please confirm transaction.");self.token.methods.approve(self.config.contract.address,self.toWei(self.val.approve+"")).send({from:self.user.address});}else{console.log("Please connect to wallet!");}},buy(){var self=this;let amount=parseFloat(self.val.spend);if(amount<10||amount>parseFloat(self.user.allowance)||amount>self.chain.balance/.08)return;if(self.conn!=""&&self.user.address!=""){self.notify("Confirm Buy","Buying "+self.format(amount/self.chain.price)+" printers for "+amount+" BUSD");self.contract.methods.buy(self.user.ref,self.toWei(amount+"")).send({from:self.user.address}).then(res=>{self.notify("Buy Successful","Successfully bought printers!",60e3);}).catch(e=>{console.log(e);});}else{console.log("Please connect to wallet!");}},compound(){},claim(){var self=this;let amount=parseFloat(self.user.claimable);if(amount<=0)return self.notify("Nothing to collect!");if(self.conn!=""&&self.user.address!=""){self.notify("Collect BUSD","Please confirm transaction.");self.contract.methods.claim().send({from:self.user.address}).then(res=>{self.notify("Collect","Collect successful!",60e3);}).catch(e=>{console.log(e);});}else{console.log("Please connect to wallet!");}}}});})();