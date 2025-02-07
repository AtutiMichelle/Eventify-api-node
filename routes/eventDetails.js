const express=require ("express");
const router= express.Router();
const db=require("../db");

router.get('/event-details', async (req, res) => {
    const sql = 'SELECT * FROM events'; 
    try {
      db.query(sql, (err, events) => {  
        if (err) {
          console.error('Error fetching events:', err);
          return res.status(500).json({ error: 'Error fetching event details', message: err.message });
        }

        if (events.length === 0) {
          return res.status(404).json({ error: 'No events found' });
        }
        
        res.json(events); 
      });
    } catch (error) {
      console.error('Error fetching events:', error); // Log the error for debugging
      res.status(500).json({ error: 'Error fetching event details', message: error.message });
    }
});
 

router.get("/:id", async (req ,res)=>
{
    const eventId=req.params.id;

    try{
        const [event]= await db.execute("SELECT * FROM events where id =? ", [eventId]);
        if(event.length===0){
            return res.status(404).json({error :"Event not found"});

        }
        res.json(event[0]);
    }
    catch(error){
        res.status(500).json({error:"Error fetching event details"});
    }
});

module.exports=router;