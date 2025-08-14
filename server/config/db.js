import mongoose from 'mongoose'

const connectDb = async () => {
    try {
        const url = process.env.MONGO_URL;
        if(!url){
            console.log('DB url not fetch')
            return;
        }


       await mongoose.connect(url)

        console.log("DB Connacted...")
    } catch (error) {
        console.log('Not DB Connect...')
    }
}

export default connectDb;