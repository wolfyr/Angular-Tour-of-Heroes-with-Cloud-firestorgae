import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Location } from '@angular/common';

import { Hero } from '../hero';
import { HeroService }  from '../hero.service';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: [ './hero-detail.component.css' ]
})
export class HeroDetailComponent implements OnInit {
  key: string;
  @Input() hero: Hero;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private heroService: HeroService,
    private location: Location
  ) {}

  ngOnInit() {
    this.key = this.route.snapshot.params['nr'];

    this.heroService.getHero(this.key).subscribe(hero => {
      this.hero = hero;     

    });
  }

  delete(hero: Hero): void {
    this.heroService.deleteHero(hero, this.key);
    this.goBack()
  }

  goBack() {
    this.location.back();
  }

  save() {
    this.heroService.updateHero(this.hero, this.key);
  }
}
