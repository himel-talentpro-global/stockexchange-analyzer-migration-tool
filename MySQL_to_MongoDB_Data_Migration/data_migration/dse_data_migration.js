import dotenv from 'dotenv';
dotenv.config();

import { pool } from "../db_config/dhaka_stock_exchange_db.mjs";
import companiesModel from "../models/company.mjs";
import circuitbreaksModel from "../models/circuit_breaks.mjs";
import price_earningsModel from '../models/price_earnings.mjs';
import sectorsModel from '../models/sector.mjs';
import mongoose from "mongoose";
import { getLastData, setLastData } from "../last_data.js";

// Reading MySQL dhaka_stock_exchange tables name and storing into an array.................


async function tableName_DSE() {
  const tables_DSE = [];
  const results    = await pool.query(`SHOW TABLES`);
  for (let i in results) {
    // console.log("i", results[i]);
    tables_DSE.push(results[i].Tables_in_scraped_data);
  }
  return tables_DSE;
}


const dse_tables = async () => {

  var mySql_tables_DSE;
  mySql_tables_DSE = await tableName_DSE();

  console.log("mySql_tables_DSE", mySql_tables_DSE);

  // const db = await dbConnect();  //***Connection to the MongoDB Database        
  // mongoose.connect('mongodb://localhost:27017/DSE');  /******Need to handle Connection in a efficient Way *********/
  mongoose.connect(process.env.DATABASE_URL);  /******Need to handle Connection in a efficient Way *********/

 let LastDoc = await getLastData();  //Getting last migration trace from DB.

  mySql_tables_DSE.forEach(async (element) => {
    
    if (element =='pe' || element == 'company' || element =='circuit_breaker') { // element =='pe' || element == 'company' || element =='circuit_breaker' || element == 'sectors' || 
      // console.log(element);
          let table  = element, model, SortOn, LastData, queryTable, selectQuery, fieldName, whereValue;
              fieldName = `${table}LastData`;
              LastData  = LastDoc[0][fieldName];
              // LastData  = '1';

      console.log("From DSE...",'price_earnings:',LastData, fieldName);
      try {
        if (table == 'company') {
          model  = companiesModel;
          SortOn = 'code';
          whereValue = 'code';
          selectQuery = `*`;
          queryTable =`company`;
        }
        else if(table == 'circuit_breaker'){
          model       = circuitbreaksModel;
          whereValue = 'created_at';
          SortOn      = 'created_at';
          selectQuery = '*'; 
          queryTable = 'circuit_breaker';
        }
        else if(table == 'pe'){
          model       = price_earningsModel;
          whereValue = 'created_at';
          SortOn     = 'created_at';
          selectQuery= '*';
          queryTable = 'pe';
        }
        else {
          throw new Error('No model found');
        }
        let dseResults;

        function dseDataMigration(){
          console.log("LastData.....", LastData);
          dseResults = pool.query(`SELECT
                ${selectQuery}
                FROM 
                ${queryTable}
                WHERE ${whereValue} > '${LastData}'
                ORDER BY ${SortOn}
                `);
                // console.log("dseResults..........", dseResults);
                
          dseResults
              .then(async (results) => {
              if (Object.keys(results).length != 0) {
                console.time(`Writing_Time_to..${table}`);

             if(table == 'pe'){ /* 
                                                      *Only For Price Earnings Table
                                                    */
                results.map(async (item)=>{
                  // console.log("price_earnings..........", item);
                    const response = await model.updateOne(
                      {company_code:item.company_code, created_at: item.created_at},
                      {$set:{
                        // company_code:item.code,
                        updated_at:item.updated_at,
                        close_price: item.close_price,
                        ycp: item.ycp,
                        pe_1: item.pe_1,
                        pe_2: item.pe_2,
                        pe_3: item.pe_3,
                        pe_4: item.pe_4,
                        pe_5: item.pe_5,
                        pe_6: item.pe_6,
                        // created_at: item.created_at,
                      }},
                      { upsert: true }
                      );
                    
                    // console.log("Print.......", response);

                })
              }
              else{
                console.log("price_earnings.....2.....", table);
                try {
                  console.log(".............Writing to DB..........",results);
                  await model.insertMany(results, { ordered: false });
                } catch (error) {
                  console.log("DSE_Error");
                }
                // await model.insertMany(results, { ordered: false });
              }
                console.timeEnd(`Writing_Time_to..${table}`);
                // LastData = results.pop()[SortOn];
                LastData = results.pop()[SortOn].toLocaleString("sv-SE");
                // console.log("LastData.....*******.....", LastData);
                await setLastData({[fieldName] : LastData});         //Saving last migrated data trace to DB.

                dseDataMigration(); // Repeatative function Calling...
              }
              else{
                console.log("Task Completed...For...", table);
              }
            });
        }
        dseDataMigration();
      }
      catch (error) {
        console.log(error);
      }
    }
  });
};

export {dse_tables};

