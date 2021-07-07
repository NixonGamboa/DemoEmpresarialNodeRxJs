import Id from "../Id";
import { fromEvent, Observable, from, lastValueFrom } from "rxjs";
const { toArray } = require('rxjs/operators');
export default function makeCommentsDb({ makeDb }) {
  return Object.freeze({
    findAll,
    findByHash,
    findById,
    findByPostId,
    findReplies,
    insert,
    remove,
    update,
  });

  
  async function findAll({ publishedOnly = false } = {}) {
    //const db = await makeDb();
    const db$ = from( makeDb());
    const db = await lastValueFrom(db$)
    
    const query = publishedOnly ? { published: true } : {};
    const result$ = from(db.collection("comments").find(query))
    const resultArray$ = result$.pipe(toArray())
    const toreturn = await lastValueFrom(resultArray$) 
    return toreturn
    //const values = resultArray$.subscribe(val=>{
      //console.log("Reactive result")
      //console.log(val)})
  }

  /*async function findAll({ publishedOnly = false } = {}) {
    const db = await makeDb();
    //console.log("db normalita")
    //console.log(db)
    const toreturn = null;
    const db$ = from( makeDb());
    db$.subscribe(async db =>{
      const query = publishedOnly ? { published: true } : {};
      const result$ = from(db.collection("comments").find(query))
      const resultArray$ = result$.pipe(toArray())
      toreturn = await lastValueFrom(resultArray$) 
      
      //const values = resultArray$.subscribe(val=>{
        //console.log("Reactive result")
        //console.log(val)})
      })    
    return await toreturn
 
  }*/
  
  async function findById({ id: _id }) {
    const db = await makeDb();
    const result = await db.collection("comments").find({ _id });
    const found = await result.toArray();
    if (found.length === 0) {
      return null;
    }
    const { _id: id, ...info } = found[0];
    return { id, ...info };
  }
  async function findByPostId({ postId, omitReplies = true }) {
    const db = await makeDb();
    const query = { postId: postId };
    if (omitReplies) {
      query.replyToId = null;
    }
    const result = await db.collection("comments").find(query);
    return (await result.toArray()).map(({ _id: id, ...found }) => ({
      id,
      ...found,
    }));
  }
  async function findReplies({ commentId, publishedOnly = true }) {
    const db = await makeDb();
    const query = publishedOnly
      ? { published: true, replyToId: commentId }
      : { replyToId: commentId };
    const result = await db.collection("comments").find(query);
    return (await result.toArray()).map(({ _id: id, ...found }) => ({
      id,
      ...found,
    }));
  }
  async function insert({ id: _id = Id.makeId(), ...commentInfo }) {
    const db = await makeDb();
    const result = await db
    .collection("comments")
    .insertOne({ _id, ...commentInfo });

    fromEvent(result).pipe(
      console.log("Insertado en db"),
      console.log(result)
    )

    /*const getAllCommentsObs = new Observable((subs) => {
      subs.next(db
        .collection("comments")
        .insertOne({ _id, ...commentInfo }));
    });
    getAllCommentsObs.subscribe((res) => {
      console.log(res);
      console.log("Insertando Comentario")
      const { _id: id, ...insertedInfo } = res.ops ;
      return { id, ...insertedInfo };
    });*/
    
    const { _id: id, ...insertedInfo } = result.ops[0];
    return { id, ...insertedInfo };
  }

  async function update({ id: _id, ...commentInfo }) {
    const db = await makeDb();
    const result = await db
      .collection("comments")
      .updateOne({ _id }, { $set: { ...commentInfo } });
    return result.modifiedCount > 0 ? { id: _id, ...commentInfo } : null;
  }
  async function remove({ id: _id }) {
    const db = await makeDb();
    const result = await db.collection("comments").deleteOne({ _id });
    return result.deletedCount;
  }
  async function findByHash(comment) {
    const db = await makeDb();
    const result = await db.collection("comments").find({ hash: comment.hash });
    const found = await result.toArray();
    if (found.length === 0) {
      return null;
    }
    const { _id: id, ...insertedInfo } = found[0];
    return { id, ...insertedInfo };
  }
}
