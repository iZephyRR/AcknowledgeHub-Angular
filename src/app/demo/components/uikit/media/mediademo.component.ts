import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/demo/api/product';

@Component({
    templateUrl: './mediademo.component.html'
})
export class MediaDemoComponent  {

    products!: Product[];

    images!: any[];



    carouselResponsiveOptions: any[] = [
        {
            breakpoint: '1024px',
            numVisible: 3,
            numScroll: 3
        },
        {
            breakpoint: '768px',
            numVisible: 2,
            numScroll: 2
        },
        {
            breakpoint: '560px',
            numVisible: 1,
            numScroll: 1
        }
    ];


}
