import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

// نفس شكل ردود الـ list في Route E-Commerce API بس فاضية
export const EMPTY_LIST_RESPONSE = {
  results: 0,
  metadata: { currentPage: 1, numberOfPages: 1, limit: 40 },
  data: [],
};

/*
  الكومبوننتات اللي بتستخدم rxResource بتبعت طلب HTTP أول ما تتعمل،
  ومع HttpClientTesting الطلب ده مبيخلصش لوحده — فـ fixture.whenStable() بيفضل مستني للأبد.
  الدالة دي بترد على كل الطلبات المعلقة (ولو طلب جاب طلب تاني بترد عليه كمان).
*/
export async function flushPendingRequests<T>(
  fixture: ComponentFixture<T>,
  body: object = EMPTY_LIST_RESPONSE,
): Promise<void> {
  const httpTesting = TestBed.inject(HttpTestingController);

  for (let round = 0; round < 5; round++) {
    fixture.detectChanges();
    const pending = httpTesting.match(() => true);
    if (pending.length === 0) return;
    pending.forEach((req) => req.flush(body));
    await new Promise((resolve) => setTimeout(resolve));
  }
}
