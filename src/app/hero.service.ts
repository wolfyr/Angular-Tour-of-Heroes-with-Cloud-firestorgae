import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';

import { Hero } from './hero';
import { MessageService } from './message.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class HeroService {

  heroesCollection: AngularFirestoreCollection<Hero>;
  heroDoc: AngularFirestoreDocument<Hero>;
  heroes: Observable<Hero[]>;
  hero: Observable<Hero>;


  heroesUrl = 'api/heroes'; 

  constructor(
    private asf: AngularFirestore,
    private http: HttpClient,
    private messageService: MessageService
    ) {
      this.heroesCollection = this.asf.collection('heroes');
     }


  //Get all Heroes
  getHeroes (): Observable<Hero[]> {
    this.heroesCollection = this.asf.collection<Hero>('/heroes');
    this.heroes = this.heroesCollection.snapshotChanges().map(actions => {
    return actions.map(a => {
      const data = a.payload.doc.data() as Hero;
      const id = a.payload.doc.id;
      data.nr = id
      return { id, ...data };
      });
    });
    
    return this.heroes;
  }


  //Get one hero
  getHero(key: string): Observable<Hero> {
    this.heroDoc = this.asf.doc<Hero>(`heroes/${key}`);
    this.hero = this.heroDoc.snapshotChanges().map(action => {
      if(action.payload.exists === false){
        return null;
      } else {
        const data = action.payload.data() as Hero;
        console.log(data)
        return data;
      }
    });

    return this.hero
  }

  
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      // if there is no search term, return an empty array
      return of([]);
    }
    return this.http.get<Hero[]>(`heroes/?name=${term}`).pipe(
      tap(_ => this.log(`found heroes matching "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }

  

  //Add a hero
  addHero (hero: Hero) {
    hero.id = Math.floor(Math.random() * 20);
    this.heroesCollection.add(hero);
  } 

  //Delete a hero
  deleteHero (hero: Hero, key: string) {
    this.heroDoc = this.asf.doc<Hero>(`heroes/${key}`);
    this.heroDoc.delete();
  }

  //Update a hero
  updateHero (hero: Hero, key: string) {
    this.heroDoc = this.asf.doc<Hero>(`heroes/${key}`);
    this.heroDoc.update(hero);
  }

  
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      console.error(error); 

      this.log(`${operation} failed: ${error.message}`);

      return of(result as T);
    };
  }

  
  private log(message: string) {
    this.messageService.add('HeroService: ' + message);
  }
}
