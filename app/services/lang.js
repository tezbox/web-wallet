app.service('Lang', function() {
   var _lang = "english",
   _langs = [
      {
        "id" : "english",
        label : "English"
      }
    ],
    _translations = {
      "english" : {
        "my_accounts" : "My Accounts",
        "add_account" : "Add Account",
        "level" : "level",
        "disclaimer" : "Disclaimer",
        "terms" : "Terms",
        "privacy" : "Privacy",
        "view_on_tzscan" : "View on TzScan",
        "account_notadded" : "This account has not been added to the blockchain yet - please wait for a baker to include this in a block before you can use this account. This error may also show if your device can't connect to the Tezos Network.",
        
        "transactions" : "Transactions",
        "send" : "Send",
        "delegate" : "Delegate",
        "options" : "Options",
        
        "no_transactions" : "No transactions available",
        "received" : "RECEIVED",
        "sent" : "SENT",
        "from" : "from",
        "to" : "to",
        "last_20_transactions" : "Only the last 20 transactions are being displayed.",
        "view_more_here" : "View more here",
        
        "destination_address" : "Destination Address",
        "destination_tooltip" : "This is the address you want to send to - please enter a valid KT1 or tz address",
        "enter_address" : "Enter Address",
        "amount" : "Amount",
        "amount_tooltip" : "Please enter an amount in tez. When sending from a tz address, you must leave at least 0.000001 behind",
        "max" : "Max",
        "fee" : "Fee",
        "fee_tooltip" : "This is the total fee to paid for the transaction. Currently 0 tez fees are accepted.",
        "custom_fee" : "Custom Fee",
        "fee_options" : "Fee Options",
        "no_fee" : "No Fee",
        "low" : "Low",
        "medium" : "Medium",
        "high" : "High",
        "show_advanced_options" : "Show Advanced Options",
        "hide_advanced_options" : "Hide Advanced Options",
        
        "parameters" : "Parameters",
        "parameters_tooltip" : "Optional parameters to send as input - this is only required for some smart contracts.",
        "gas_limit" : "Gas Limit",
        "gas_limit_tooltip" : "Set the gas limit for this operations. For simple transactions, you can leave this as the default",
        "storage_limit" : "Storage Limit",
        "storage_limit_tooltip" : "Set the storage limit for this operations. For simple transactions, you can leave this as the default",
        "clear" : "Clear",
        
        "ensure_delegate" : "Please ensure the delegate you are entering has been registered to participate in the baking protocol.",
        "endorse_delegate" : "TezBox doesn't endorse any of the listed delegation services listed below - please ensure you are doing your own research into each one.",
        "disabled_delegate" : "Delegation from this address is not allowed (lowercase tz addresses) - these are referred to as implicit addresses and the protocol doesn't allow them to delegate to another key. Please create an account (KT address) to use for delegation.",
        
        "delegate_options" : "Delegate Options",
        "delegate_options_tooltip" : "Delegate your account to participate in the baking process. Select a pre-set baker, or enter your own",
        "custom_delegate" : "Custom Delegate",
        "custom_delegate_tooltip" : "Enter your custom delegate address here - it must start with tz...",
        "update_delegate" : "Update Delegate",
        
        "title" : "Title",
        "update_title" : "Update Title",
        "import_kt1_account" : "Import KT1 Account",
        "import_kt1_account_msg" : "You can use this to import KT1 addresses that have been originated else where (or after you have restored your account). You can view all of your originated KT1 addresses on",
        "import" : "Import",
        "remove_account" : "Remove Account",
        
        "connected_to" : "Connected to",
        "not_connected" : "Not Connected",
      }
    },
    r = {};
    r.setLang = function(l){
        _lang = l;
    };
    r.getLangs = _langs;
    r.translate = function(id){
        return (typeof _translations[_lang][id] != 'undefined' ? _translations[_lang][id] : _lang + "." + id);
    };
    return r;
});
