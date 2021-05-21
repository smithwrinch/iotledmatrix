from django.shortcuts import render
from django.shortcuts import redirect
from hello_world.models import Matrix
from hello_world.models import DataAnalytics
from django.http import JsonResponse
from datetime import datetime as d
import json
import math
import time
import re

def create_matrix():
    m = Matrix.objects.create()
    l = [[0,0,0]] * 64
    ll = [l]*64
    t = [time.time()] * 64
    tt = [t]*64
    m.json = ll
    m.timings = tt
    m.save()



def hello_world(request):
    if(Matrix.objects.count() == 0):
        create_matrix()
    leds = Matrix.objects.last().json # should only be one
    rows = [];

    for i in range(64):
        temp = []
        for j in range(64):
            #TODO: add channels. work out how data is being sent
            channels = []
            for c in range(3):
                channels.append(leds[i][j][c])
            temp.append(channels)
        rows.append(temp)

    oldJson = Matrix.objects.order_by('-id')[1:9]
    # oldJson = reversed(oldJson)
    oldJson = [x.json for x in oldJson]

    created = Matrix.objects.last().created_at
    naive = created.replace(tzinfo=None)
    delta = (d.now() - naive).total_seconds()

    context = {
        'leds': rows,
        'old' :oldJson,
        'created_at': Matrix.objects.last().created_at.strftime("%m/%d/%Y, %H:%M:%S"),
        'delta' : delta

    }
    return render(request, 'hello_world.html', context)

def get_JSON(request):
    matrix = Matrix.objects.last()
    if request.method == 'POST':
        data = request.POST.get('colour', None)
        col_to_update = json.loads(data)
        for n, x in enumerate(col_to_update):
            if(n > 512):
                break
            col = x[0]
            row = x[1]
            # t = time.time() - matrix.timings[col][row]
            #
            # if(t > 10):
            for c in range(3):
                    matrix.json[col][row][c] = x[2][c]
        matrix.save();

        return JsonResponse(data, safe=False)

#GET request that returns JSON; for esp8266
def get_colour(request):
    leds = Matrix.objects.last().json;
    out = ""
    for i in range(64):
        for j in range(64):
            for c in range(3):
                num =  math.floor(leds[63-i][63-j][c]/128)
                out += str(num)
        # out +="\n"

    context = {
        'leds': out#leds[0]
    }
    getFrequency()
    return render(request, 'data.json', context)

def refreshGetColour(request):
    leds = Matrix.objects.last().json
    context = {
        'leds': leds
    }
    return JsonResponse(context, safe=False)

def getLastMatrix(request):
    created = Matrix.objects.last().created_at
    naive = created.replace(tzinfo=None)
    delta = (d.now() - naive).total_seconds()
    context = {
    'time' : created.strftime("%m/%d/%Y, %H:%M:%S"),
    'delta' : delta}
    return JsonResponse(context, safe=False)#render(request, 'last.json', context)

#from x y get rgb
def colourFromCoord(out, x,y):
    r =  out[y*64 + x]
    g =  out[y*64 + x+1]
    b =  out[y*64 + x+2]
    # return
    return "#" + r + g +  b;

def getFrequency():
    leds = Matrix.objects.last().json;
    array = [0]*8
    for i in range(64):
        for j in range(64):
            for c in range(3):
                array[math.floor(leds[i][j][c]/32)] +=1
    print(array)

def reset_button(request):
    created = Matrix.objects.last().created_at
    naive = created.replace(tzinfo=None)
    delta = (d.now() - naive).total_seconds()
    if(delta > 120):
        create_matrix();
    return redirect('hello_world')

def about_page(request):

    context = {
        'count': Matrix.objects.count()
    }
    return render(request, "about.html", context);
