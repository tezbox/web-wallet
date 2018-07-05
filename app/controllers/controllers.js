app.controller('CreateController', ['$scope', '$location', 'Storage', '$sce', function($scope, $location, Storage, $sce) {
    $scope.passphrase = '';
    $scope.mnemonic = '';
    $scope.cancel = function(){
        $location.path('/new');
    };
    $scope.newMnemonic = function(){
       $scope.mnemonic = window.eztz.crypto.generateMnemonic();
    }
    $scope.showSeed = function(m){
      var mm = m.split(" ");
      return $sce.trustAsHtml("<span>"+mm.join("</span> <span>")+"</span>");
    }
    $scope.newMnemonic();
    $scope.create = function(){
        var keys = window.eztz.crypto.generateKeys($scope.mnemonic, $scope.passphrase);
        var identity = {
            temp : {sk : keys.sk, pk : keys.pk, pkh : keys.pkh},
            pkh : keys.pkh,
            accounts : [{title: "Main", address : keys.pkh, public_key : keys.pk}],
            account : 0,
            transactions : {},
        };
        Storage.setStore(identity);
        $location.path("/validate");
    };
}])
.controller('MainController', ['$scope', '$location', '$http', 'Storage', function($scope, $location, $http, Storage) {
    window.hideLoader();
    var protos = {
      "PtCJ7pwoxe8JasnHY8YonnLYjcVHmhiARPJvqcC6VfHT5s8k8sY" : "Betanet"
    }
    var ss = Storage.loadStore();
    if (!ss || !ss.ensk || !ss.temp){
       $location.path('/new');
    }
    $scope.setting = Storage.loadSetting();

    
      
    $scope.accounts = ss.accounts;
    $scope.account = ss.account;
    $scope.accountDetails = {};
    $scope.transactions = [];
    $scope.accountLive = true;
    
    $scope.tt = $scope.accounts[$scope.account].title;
    
    $scope.amount = 0;
    $scope.fee = 0;
    $scope.parameters = '';
    $scope.delegateType = '';
    $scope.dd = '';
    $scope.block = {
      net : "Loading..",
      level : "N/A",
      proto : "Loading",
    };
    refreshHash = function(){
      window.eztz.rpc.getHead().then(function(r){
        $scope.$apply(function(){
          $scope.block = {
            net : r.chain_id,
            level : r.header.level,
            proto : "Connected to " + protos[r.protocol],
          };
        });
      }).catch(function(e){
        $scope.$apply(function(){
          $scope.block = {
            net : "Error",
            level : "N/A",
            proto : "Not Connected",
          };
        });
      });
    }
    refreshHash();
    var ct = setInterval(refreshHash, 20000);
    $scope.viewSettings = function(){
        clearInterval(ct);
        $location.path('/setting');
    }
    $scope.lock = function(){
        clearInterval(ct);
        delete ss.temp;
        Storage.setStore(ss);
        $location.path('/unlock');
    }
    $scope.saveTitle = function(){
      if (!$scope.tt){
          alert("Please enter a new title");
          return;
      }
      $scope.accounts[$scope.account].title = $scope.tt;
      ss.accounts = $scope.accounts;
      Storage.setStore(ss);
      $scope.refresh();
    };
    $scope.kt1 = '';
    $scope.import = function(){
      if (!$scope.kt1) return alert("Please enter the KT1 address to import");
      window.showLoader();      
      window.eztz.node.query("/chains/main/blocks/head/context/contracts/"+$scope.kt1+"/manager").then(function(r){
        if (r != $scope.accounts[0].address) return alert("That contract is not managed by your account key");
        $scope.$apply(function(){
          $scope.accounts.push(
            {
              title : "Account " + ($scope.accounts.length),
              address : $scope.kt1
            }
          );
          $scope.account = ($scope.accounts.length-1);
          ss.accounts = $scope.accounts;
          ss.account = $scope.account;
          Storage.setStore(ss);
          $scope.refresh();
          window.hideLoader();
        })
      }).catch(function(r){
        window.hideLoader();
        alert("There was an error importing that account");
      });
    };
    $scope.remove = function(){
      if (confirm("Are you sure you want to proceed with removing this account?")){
        $scope.accounts.splice($scope.account, 1);
        $scope.account = 0;
        $scope.refresh();
      }
    };
    $scope.add = function(){
      if (!confirm("Creating a new account incurs an origination fee of ~0.25XTZ - do you want to continue?")) return;
      var keys = ss.temp;
      window.showLoader();      
      window.eztz.rpc.account(keys, 0, true, true, keys.pkh, 0).then(function(r){
        $scope.$apply(function(){
          var address = window.eztz.contract.hash(r.hash, 0);
          if ($scope.accounts[$scope.accounts.length-1].address != address){
            $scope.accounts.push(
              {
                title : "Account " + ($scope.accounts.length),
                address : address
              }
            );
            $scope.account = ($scope.accounts.length-1);
            ss.accounts = $scope.accounts;
            ss.account = $scope.account;
            Storage.setStore(ss);
          } else {
            alert("Error: awaiting existing origination to activate");
          }
          $scope.refresh();
          window.hideLoader();
        });
      }).catch(function(r){
        window.hideLoader();
        if (typeof r.errors !== 'undefined'){
            
          ee = r.errors[0].id.split(".").pop();
          alert(r.error + ": Error (" + ee + ")");
        } else alert("There was an error adding account. Please ensure your main account has funds available");
      });
    };
    $scope.delegates = {
      keys : [
      'tz1Tnjaxk6tbAeC2TmMApPh8UsrEVQvhHvx5',
      'tz1LesY3S4wfe15SNm1W3qJmQzWxLqVjTruH',
      'tz1TDSmoZXwVevLTEvKCTHWpomG76oC9S2fJ',
      ],
      names : [
        'CryptoDelegate',
        'xtez.io',
        'Tezos.Community',
      ]
    };
    
    $scope.loadAccount = function(a){
      $scope.account = a;
      ss.account = $scope.account
      $scope.tt = $scope.accounts[$scope.account].title;;
      Storage.setStore(ss);
      if (typeof ss.transactions[$scope.accounts[$scope.account].address] != 'undefined')
        $scope.transactions = ss.transactions[$scope.accounts[$scope.account].address];
      else
        $scope.transactions = [];
      $scope.accountDetails = {
          balance : "Loading...",
          usd : "Loading...",
          raw_balance : "Loading...",
      };
      window.eztz.rpc.getDelegate($scope.accounts[a].address).then(function(r){
        $scope.$apply(function(){
          $scope.dd = r;
          console.log(r);
          var ii = $scope.delegates.keys.indexOf($scope.dd);
          if (ii >= 0){
            $scope.delegateType = $scope.dd;
          } else 
            $scope.delegateType = '';
          
        });
      });
      window.eztz.rpc.getBalance($scope.accounts[a].address).then(function(r){
        $scope.$apply(function(){
          $scope.accountLive = true;
          var rb = parseInt(r);
          bal = eztz.utility.mintotz(rb); 
          var usdbal = bal * 1.78;
          $scope.accountDetails.raw_balance = rb;
          $scope.accountDetails.balance = window.eztz.utility.formatMoney(bal, 2, '.', ',')+"ꜩ";
          $scope.accountDetails.usd = "$"+window.eztz.utility.formatMoney(usdbal, 2, '.', ',')+"USD";
        });
      }).catch(function(e){
        $scope.$apply(function(){
          $scope.accountLive = false;
          var rb = parseInt(0);
          bal = eztz.utility.mintotz(rb); 
          var usdbal = bal * 1.78;
          $scope.accountDetails.raw_balance = rb;
          $scope.accountDetails.balance = window.eztz.utility.formatMoney(bal, 2, '.', ',')+"ꜩ";
          $scope.accountDetails.usd = "$"+window.eztz.utility.formatMoney(usdbal, 2, '.', ',')+"USD";
        });
      });
    }
    $scope.refresh = function(){
        $scope.loadAccount($scope.account);
    };
    $scope.copy = function(){
      alert("Copied to clipboard");
        window.copyToClipboard($scope.accounts[$scope.account].address);
    };
    
    
    $scope.send = function(){
      if (!$scope.amount || !$scope.toaddress) {
        alert("Please enter amount and a destination");
        return;
      }
      if ($scope.amount < 0) return alert("Invalid amount entered - please enter a positive number");
      if ($scope.fee < 0) return alert("Invalid amount entered - please enter a positive number");
      if ($scope.amount != parseFloat($scope.amount)) return alert("Invalid amount entered - please enter a valid number");
      if ($scope.fee != parseFloat($scope.fee)) return alert("Invalid amount entered - please enter a valid number");
      if (!confirm("Are you sure you want to send " + $scope.amount + "XTZ to " + $scope.toaddress + "?")) return false;
      window.showLoader();
      var keys = {
        sk : ss.temp.sk,
        pk : ss.temp.pk,
        pkh : $scope.accounts[$scope.account].address,
      };
      if ($scope.parameters){
        var op = window.eztz.contract.send($scope.toaddress, $scope.accounts[$scope.account].address, keys, $scope.amount, $scope.parameters, $scope.fee);
      } else {
        var op = window.eztz.rpc.transfer($scope.accounts[$scope.account].address, keys, $scope.toaddress, $scope.amount, $scope.fee);
      }
      op.then(function(r){
        $scope.$apply(function(){
          if (typeof ss.transactions[$scope.accounts[$scope.account].address] == 'undefined')
            ss.transactions[$scope.accounts[$scope.account].address] = [];
          
          var myDate = new Date();
          var month=new Array();
          month[0]="Jan";
          month[1]="Feb";
          month[2]="Mar";
          month[3]="Apr";
          month[4]="May";
          month[5]="Jun";
          month[6]="Jul";
          month[7]="Aug";
          month[8]="Sep";
          month[9]="Oct";
          month[10]="Nov";
          month[11]="Dec";
          var hours = myDate.getHours();
          var minutes = myDate.getMinutes();
          var ampm = hours >= 12 ? 'pm' : 'am';
          hours = hours % 12;
          hours = hours ? hours : 12;
          minutes = minutes < 10 ? '0'+minutes : minutes;
          var strTime = hours + ':' + minutes;
          ss.transactions[$scope.accounts[$scope.account].address].unshift({
            hash: r.hash,
            to: $scope.toaddress,
            date: myDate.getDate()+" "+month[myDate.getMonth()]+" "+myDate.getFullYear()+" "+strTime,
            amount: $scope.amount	
          });
           Storage.setStore(ss);
          window.hideLoader();
          alert("Transaction has been sent!");
          $scope.clear();
        });
      }).catch(function(r){
        $scope.$apply(function(){
          window.hideLoader();
          if (typeof r.errors !== 'undefined'){
            ee = r.errors[0].id.split(".").pop();
            alert("Operation Failed! " + r.error + ": Error (" + ee + ")");
          } else {
            alert("Operation Failed! Please check your inputs");
          }
        });
      });
    };
     $scope.clear = function(){
      $scope.amount = 0;
      $scope.fee = 0;
      $scope.toaddress = '';
      $scope.parameters = '';
    }
    $scope.updateDelegate = function(){
        if ($scope.delegateType) $scope.dd = $scope.delegateType;
        if (!$scope.dd) {
          alert("Please enter or a valid delegate");
          return;
        }
        window.showLoader();
        var keys = {
          sk : ss.temp.sk,
          pk : ss.temp.pk,
          pkh : $scope.accounts[$scope.account].address,
        };
        window.eztz.rpc.setDelegate($scope.accounts[$scope.account].address, keys, $scope.dd, 0).then(function(r){
          $scope.$apply(function(){
            alert("Delegation operation was successful - this may take a few minutes to update");
            window.hideLoader();
          });
        }).catch(function(r){
          $scope.$apply(function(){
            alert("Delegation Failed");
            window.hideLoader();
          });
        });
    }
    $scope.refresh();
    
}])
.controller('NewController', ['$scope', '$location', 'Storage', function($scope, $location, Storage) {
    $scope.setting = Storage.loadSetting();
    if (!$scope.setting) $scope.setting = {
      rpc : "https://rpc.tezrpc.me",
      disclaimer : false
    };
    window.eztz.node.setProvider($scope.setting.rpc);
    
    var checkStore = function(){     
      var ss = Storage.loadStore();
      if (ss && typeof ss.temp != 'undefined' && ss.temp.sk && ss.temp.pk && ss.temp.pkh){
          $location.path('/main');
      }  else if (ss && ss.ensk){
          $location.path('/unlock');
      }
    };
    if ($scope.setting.disclaimer) {
      checkStore();
    }
    $scope.acceptDisclaimer = function(){
      $scope.setting.disclaimer = true;
      Storage.setSetting($scope.setting);
      checkStore();
    };
    $scope.restore = function(){
        $location.path('/restore');
    };
    $scope.create = function(){
        $location.path('/create');
    };
    
}])
app.controller('ValidateController', ['$scope', '$location', 'Storage', '$sce', function($scope, $location, Storage, $sce) {
    var ss = Storage.loadStore();
    if (ss  && ss.ensk && typeof ss.temp != 'undefined' && ss.temp.sk && ss.temp.pk && ss.temp.pkh){
        $location.path('/main');
    }  else if (ss && ss.ensk){
        $location.path('/unlock');
    }
    $scope.cancel = function(){
        Storage.clearStore();
        $location.path('/new');
    };
    $scope.passphrase = '';
    $scope.mnemonic = '';
    $scope.validate = function(){
      var keys = window.eztz.crypto.generateKeys($scope.mnemonic, $scope.passphrase);
      if (keys.pkh != ss.pkh) {
        alert("Sorry, those details do not match - please try again, or go back and create a new account again");
      } else {        
        $location.path("/encrypt");
      }
    };
}])
.controller('SettingController', ['$scope', '$location', 'Storage', function($scope, $location, Storage) {
    var ss = Storage.loadStore();
    if (!ss || !ss.ensk || !ss.temp){
       $location.path('/new');
    }
    $scope.setting = Storage.loadSetting();
    $scope.privateKey = '';
    $scope.password = '';
    $scope.save = function(){
      Storage.setSetting($scope.setting);
      window.eztz.node.setProvider($scope.setting.rpc);
      $location.path('/main');
    }
    $scope.show = function(){
      if (!$scope.password) return alert("Please enter your password");
      window.showLoader();
      setTimeout(function(){
        $scope.$apply(function(){
          try {
            var raw = sjcl.decrypt(window.eztz.library.pbkdf2.pbkdf2Sync($scope.password, ss.pkh, 30000, 512, 'sha512').toString(), ss.ensk);
          } catch(err){
            window.hideLoader();
            $scope.password = '';
            alert("Incorrect password");
            return;
          }
          $scope.password = '';
          $scope.privateKey = raw;
          window.hideLoader();
        });
      }, 100);
    };
    
}])
.controller('UnlockController', ['$scope', '$location', 'Storage', function($scope, $location, Storage) {
    var ss = Storage.loadStore();
    if (!ss || !ss.ensk){
         $location.path('/new');
    } else if (ss && ss.ensk && ss.temp && ss.temp.sk && ss.temp.pk && ss.temp.pkh){
         $location.path('/main');
    }
    $scope.clear = function(){
        if (confirm("Are you sure you want to clear you TezBox - note, unless you've backed up your seed words you'll no longer have access to your accounts")){
          Storage.clearStore();
         $location.path('/new');
        }
    }
    $scope.unlock = function(){
        if (!$scope.password){
            alert("Please enter your password");
            return;
        }
        if ($scope.password.length < 8){
            alert("Your password is too short");
            return;
        }
        window.showLoader();
        setTimeout(function(){
          $scope.$apply(function(){
            try {
              var sk = sjcl.decrypt(window.eztz.library.pbkdf2.pbkdf2Sync($scope.password, ss.pkh, 30000, 512, 'sha512').toString(), ss.ensk);
              var c = window.eztz.crypto.extractKeys(sk);
            } catch(err){
              try {
                var sk = sjcl.decrypt(window.eztz.library.pbkdf2.pbkdf2Sync($scope.password, '', 10, 32, 'sha512').toString(), ss.ensk);
                
                var c = window.eztz.crypto.extractKeys(sk);
                ss.ensk = sjcl.encrypt(window.eztz.library.pbkdf2.pbkdf2Sync($scope.password, c.pkh, 30000, 512, 'sha512').toString(), sk);
                ss.pkh = c.pkh;
              } catch(err){
                window.hideLoader();
                alert("Incorrect password");
                return;
              }
            }
            var identity = {
                temp : c,
                ensk : ss.ensk,
                pkh : ss.pkh,
                accounts : ss.accounts,
                account : ss.account,
                transactions : ss.transactions,
            };
            Storage.setStore(identity);
            $location.path('/main');
          });
        }, 100);
    };
}])
.controller('EncryptController', ['$scope', '$location', 'Storage', function($scope, $location, Storage) {
    var ss = Storage.loadStore();
    if (ss  && ss.ensk && typeof ss.temp != 'undefined' && ss.temp.sk && ss.temp.pk && ss.temp.pkh){
        $location.path('/main');
    }  else if (ss && ss.ensk){
        $location.path('/unlock');
    }
    $scope.cancel = function(){
        Storage.clearStore();
        $location.path('/new');
    };
    $scope.password = '';
    $scope.password2 = '';
    $scope.encrypt = function(){
        if (!$scope.password || !$scope.password2){
            alert("Please enter your password");
            return;
        }
        if ($scope.password.length < 8){
            alert("Your password is too short");
            return;
        }
        if ($scope.password != $scope.password2){
            alert("Passwords do not match");
            return;
        }
        window.showLoader();
        setTimeout(function(){
          $scope.$apply(function(){
            var identity = {
                temp : ss.temp,
                ensk : sjcl.encrypt(window.eztz.library.pbkdf2.pbkdf2Sync($scope.password, ss.temp.pkh, 30000, 512, 'sha512').toString(), ss.temp.sk),
                pkh : ss.temp.pkh,
                accounts : ss.accounts,
                account : 0,
                transactions : ss.transactions,
            };
            Storage.setStore(identity);          
            $location.path("/main");
          });
        }, 100);
    }
}])
.controller('RestoreController', ['$scope', '$location', 'Storage', function($scope, $location, Storage) {
    $scope.type = 'seed'; //seed/private_key/ico

    $scope.seed = '';
    $scope.passphrase = '';
    $scope.private_key = '';
    $scope.email = '';
    $scope.ico_password = '';
    $scope.activation_code = '';
    $scope.cancel = function(){
        $location.path('/new');
    };
    $scope.restore = function(){
        if ($scope.type == 'seed' && !$scope.seed) return alert("Please enter your seed words");
        if ($scope.type == 'ico' && !$scope.seed) return alert("Please enter your seed words");
        if ($scope.type == 'ico' && !$scope.ico_password) return alert("Please enter your passphrase");
        if ($scope.type == 'ico' && !$scope.email) return alert("Please enter your email from the ICO PDF");
        if ($scope.type == 'ico' && !$scope.address) return alert("Please enter your address/Public Key Hash from the ICO PDF");
        if ($scope.type == 'private' && !$scope.private_key) return alert("Please enter your private key");
        $scope.text = "Restoring...";
        if ($scope.type == 'seed'){
          var keys = window.eztz.crypto.generateKeys($scope.seed, $scope.passphrase);          
        } else if ($scope.type == 'ico'){
          var keys = window.eztz.crypto.generateKeys($scope.seed, $scope.email + $scope.ico_password);       
          if ($scope.address != keys.pkh) return alert("Your fundraiser details don't seem to match - please try again and ensure you are entering your details in correctly.");
        } else if ($scope.type == 'private'){
          var keys = window.eztz.crypto.extractKeys($scope.private_key);          
        }
        var identity = {
            temp : {sk : keys.sk, pk : keys.pk, pkh : keys.pkh},
            pkh : keys.pkh,
            accounts : [{title: "Main", address : keys.pkh, public_key : keys.pk}],
            account : 0,
            transactions : {}
        };
        if ($scope.type == 'ico' && $scope.activation_code){
          window.showLoader(); 
          window.eztz.rpc.activate(identity.temp, $scope.activation_code).then(function(){
            $scope.$apply(function(){
              window.hideLoader();    
              Storage.setStore(identity);          
              alert("Activation was successful - please keep in mind that it may take a few minutes for your balance to show");
              $location.path("/encrypt");
            });
          }).catch(function(e){
            $scope.$apply(function(){
              window.hideLoader();    
              return alert("Activation was unsuccessful - please ensure the code is right, or leave it blank if you have already activated it");
            });
          });
        } else {
          Storage.setStore(identity);          
          $location.path("/encrypt");
        }
    };
}])
;
