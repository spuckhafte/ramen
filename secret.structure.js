export default {
    TOKEN: "BOT_TOKEN",
    DB_URL: "mongodb+srv://<username>:<password>@<cluster-id>.mongodb.net/<db_name>?retryWrites=true&w=majority",
    MOD_CHNLS: [/* Id of channels you wanna include for testing -- only for devs */],
    REDIS_URL: "redis://default:<password>@<public_endpoint>",
    IMP_SERVERS: { /* Servers supporting private-lb */
        'server_1_id': {
            server: 'server-name',
            mod: [/* Id of users who can reset the private lb*/],
            db_refer: '' /* Key of the server as referred in the Mongo Schema */
        },

        '2224683637333357': { /* Example */
            server: 'Cool Server',
            mod: ['35346436346346346', '245435346346346'],
            db_refer: 'server1'
        }
    }
};